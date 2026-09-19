import { Router, type Request, type Response } from 'express';
import crypto from 'node:crypto';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../middleware/auth.js';
import { LeadListing } from '../models/LeadListing.js';
import { Property } from '../models/Property.js';
import { Host } from '../models/Host.js';
import { User } from '../models/User.js';
import { Room } from '../models/Room.js';
import { sendHostOutreachEmail } from '../services/emailService.js';
import { env } from '../config/env.js';

const router = Router();
export const outreachRouter = router;

import { discoverFromGooglePlaces } from '../services/discoveryService.js';

// ----------------------------------------------------------------------------
// 1. ADMIN: Search Database Lead Listings by City & Category or Keyword
// ----------------------------------------------------------------------------
outreachRouter.post(
  '/admin/leads/search',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { city, category, query, limit } = req.body as { city?: string; category?: string; query?: string; limit?: number };
      const targetLimit = Math.min(Math.max(Number(limit) || 20, 1), 50);

      const filter: Record<string, unknown> = {};

      if (city && city.trim().length > 0) {
        const escapedCity = city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        filter.city = new RegExp(escapedCity, 'i');
      }

      if (category && category.trim().length > 0 && category.toLowerCase() !== 'all') {
        const catNorm = category.toLowerCase().trim();
        if (catNorm.includes('hotel') || catNorm.includes('resort')) {
          filter.propertyType = { $in: ['hotel', 'resort', 'guesthouse', 'apartment', 'villa', 'Hotel', 'Resort'] };
        } else if (catNorm.includes('pg') || catNorm.includes('hostel')) {
          filter.propertyType = { $in: ['pg', 'hostel', 'PG', 'Hostel'] };
        } else if (catNorm.includes('homestay')) {
          filter.propertyType = { $in: ['homestay', 'villa', 'Homestay'] };
        }
      }

      if (query && query.trim().length > 0) {
        filter.$or = [
          { title: new RegExp(query.trim(), 'i') },
          { address: new RegExp(query.trim(), 'i') },
          { locality: new RegExp(query.trim(), 'i') },
        ];
      }

      // -- REAL DISCOVERY ENGINE: Run Google Places API discovery if configured --
      if (city && city.trim().length > 0 && !query) {
        try {
          await discoverFromGooglePlaces(city, category || 'hotel', targetLimit);
        } catch (discoverErr) {
          console.error('[Outreach WARNING] Failed to discover new leads:', discoverErr);
        }
      }

      const dbLeads = await LeadListing.find(filter).sort({ createdAt: -1 }).limit(targetLimit);

      const mappedDbLeads = dbLeads.map((l) => {
        const cleanTitleSlug = l.title.toLowerCase().replace(/[^a-z0-9]+/g, '');
        return {
          _id: String(l._id),
          placeId: l.placeId,
          title: l.title,
          propertyType: l.propertyType,
          city: l.city,
          locality: l.locality,
          address: l.address,
          phone: l.phone,
          email: l.email || `info@${cleanTitleSlug.slice(0, 25)}.com`,
          website: l.website,
          status: l.status,
          claimToken: l.claimToken,
          rating: l.rating || 4.8,
          primaryImage: l.primaryImage,
        };
      });

      // Aggregate UNCLAIMED properties from Property collection
      const unclaimedPropFilter: Record<string, unknown> = {};
      if (city && city.trim().length > 0) {
        const escapedCity = city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        unclaimedPropFilter.city = new RegExp(escapedCity, 'i');
      }
      if (filter.propertyType) {
        unclaimedPropFilter.propertyType = filter.propertyType;
      }
      unclaimedPropFilter.claimed = { $ne: true };

      const unclaimedProperties = await Property.find(unclaimedPropFilter).sort({ createdAt: -1 }).limit(targetLimit);

      const mappedProps = unclaimedProperties.map((p) => {
        const cleanTitleSlug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '');
        return {
          _id: String(p._id),
          placeId: p.sourcePlaceId || `prop_${p._id}`,
          title: p.title,
          propertyType: p.propertyType,
          city: p.city || 'Mumbai',
          locality: p.locality || 'Downtown',
          address: p.address || `${p.title}, ${p.city}`,
          phone: p.phone || p.contactPhone || p.ownerInfo?.phone,
          email: p.contactEmail || p.ownerInfo?.email || `contact@${cleanTitleSlug.slice(0, 25)}.com`,
          website: p.website,
          status: p.claimed ? 'CLAIMED' : 'UNCLAIMED',
          claimToken: p.claimToken || String(p._id),
          rating: 4.8,
          primaryImage: p.primaryImage,
        };
      });

      const combined: any[] = [...mappedDbLeads];
      const titles = new Set(mappedDbLeads.map((l) => l.title.toLowerCase()));

      for (const p of mappedProps) {
        if (!titles.has(p.title.toLowerCase())) {
          combined.push(p);
          titles.add(p.title.toLowerCase());
        }
      }

      const finalLeads = combined.slice(0, targetLimit);

      res.json({ data: { leads: finalLeads, count: finalLeads.length, source: 'database' } });
    } catch (error: any) {
      console.error('[Outreach ERROR] Failed searching leads:', error);
      res.status(500).json({ error: { message: error?.message || 'Failed to search lead listings.' } });
    }
  }
);

// ----------------------------------------------------------------------------
// 1b. ADMIN: Create Real Lead Listing (Add New PG / Hotel discovered)
// ----------------------------------------------------------------------------
outreachRouter.post(
  '/admin/leads/create',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { title, propertyType = 'hotel', city, locality, address, phone, email, website, rating } = req.body as {
        title: string;
        propertyType?: string;
        city: string;
        locality: string;
        address: string;
        phone?: string;
        email?: string;
        website?: string;
        rating?: number;
      };

      if (!title || !city || !locality || !address) {
        res.status(400).json({ error: { message: 'Title, City, Locality, and Address are required.' } });
        return;
      }

      const claimToken = Buffer.from(crypto.randomBytes(24)).toString('hex');
      const placeId = `lead_${city.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now()}`;

      const lead = await LeadListing.create({
        placeId,
        title,
        propertyType,
        city,
        locality,
        address,
        phone,
        email,
        website,
        rating: rating || 4.5,
        status: 'UNCLAIMED',
        claimToken,
      });

      res.json({ data: { lead, message: 'Real lead listing created successfully.' } });
    } catch (error: any) {
      console.error('[Outreach ERROR] Failed creating lead:', error);
      res.status(500).json({ error: { message: error?.message || 'Failed to create lead listing.' } });
    }
  }
);

// ----------------------------------------------------------------------------
// 1c. ADMIN: Convert Lead Listing into a Property Draft
// ----------------------------------------------------------------------------
outreachRouter.post(
  '/admin/leads/convert-to-property',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        leadId,
        title,
        propertyType,
        city,
        locality,
        address,
        phone,
        email,
        website,
        description,
        primaryImage,
        pricePerNight,
        pricePerMonth,
        isMonthlyAvailable,
        messIncluded,
        messMonthlyFee,
        maxGuests,
        amenities,
        cancellationPolicy,
      } = req.body as {
        leadId: string;
        title?: string;
        propertyType?: string;
        city?: string;
        locality?: string;
        address?: string;
        phone?: string;
        email?: string;
        website?: string;
        description?: string;
        primaryImage?: string;
        pricePerNight?: number;
        pricePerMonth?: number;
        isMonthlyAvailable?: boolean;
        messIncluded?: boolean;
        messMonthlyFee?: number;
        maxGuests?: number;
        amenities?: string[];
        cancellationPolicy?: string;
      };

      if (!leadId) {
        res.status(400).json({ error: { message: 'Lead ID is required for conversion.' } });
        return;
      }

      const lead = await LeadListing.findById(leadId);
      if (!lead) {
        res.status(404).json({ error: { message: 'Lead listing not found.' } });
        return;
      }

      const propTitle = (title || lead.title).trim();
      const slugBase = propTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const slug = `${slugBase}-${Date.now().toString().slice(-6)}`;

      const firstHost = await Host.findOne({ isActive: true }) || await Host.create({ businessName: 'Hopebed Managed' });

      const newProperty = new Property({
        host: firstHost._id,
        title: propTitle,
        slug,
        propertyType: propertyType || lead.propertyType || 'hotel',
        category: 'stay',
        city: (city || lead.city).trim(),
        locality: (locality || lead.locality).trim(),
        state: 'Maharashtra',
        country: 'India',
        address: (address || lead.address).trim(),
        phone: phone || lead.phone,
        contactPhone: phone || lead.phone,
        contactEmail: email || lead.email,
        website: website || lead.website,
        description: description || `Verified stay in ${locality || lead.locality}, ${city || lead.city}. Handpicked property.`,
        primaryImage: primaryImage || lead.primaryImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        pricePerNight: pricePerNight || 2500,
        pricePerMonth: pricePerMonth || 0,
        isMonthlyAvailable: Boolean(isMonthlyAvailable),
        messIncluded: Boolean(messIncluded),
        messMonthlyFee: messMonthlyFee || 0,
        maxGuests: maxGuests || 2,
        bedrooms: 1,
        bathrooms: 1,
        amenities: amenities && amenities.length > 0 ? amenities : ['Wi-Fi', 'Air Conditioning', 'Power Backup', 'Housekeeping'],
        cancellationPolicy: cancellationPolicy || 'Free cancellation up to 48 hours before check-in',
        status: 'DRAFT',
        verificationStatus: 'DRAFT',
        isVerified: false,
        isPublished: false,
        claimed: false,
        currency: 'INR',
      });

      await newProperty.save();

      // Create default standard Room for availability & booking calculations
      const defaultRoom = await Room.create({
        property: newProperty._id,
        name: 'Standard Deluxe Room',
        roomType: (propertyType || lead.propertyType) === 'pg' ? 'shared' : 'private',
        capacity: maxGuests || 2,
        inventory: 5,
        pricePerNight: pricePerNight || 2500,
        pricePerMonth: pricePerMonth || 0,
        messIncluded: Boolean(messIncluded),
        messMonthlyFee: messMonthlyFee || 0,
        currency: 'INR',
        isActive: true,
      });

      lead.status = 'CLAIMED';
      await lead.save();

      res.status(201).json({
        data: {
          message: 'Lead successfully converted to Property draft.',
          property: newProperty,
          room: defaultRoom,
        },
      });
    } catch (error: any) {
      console.error('[Outreach ERROR] Failed converting lead to property:', error);
      res.status(500).json({ error: { message: error?.message || 'Failed to convert lead to property.' } });
    }
  }
);

// ----------------------------------------------------------------------------
// 2. ADMIN: Import Lead & Send Automated Host Outreach Email
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// 2. ADMIN: Import Lead & Send Automated Host Outreach Email
// ----------------------------------------------------------------------------
outreachRouter.post(
  '/admin/leads/import-and-invite',
  requireAuth,
  requireRole('admin'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { leadId, ownerEmail } = req.body as { leadId?: string; ownerEmail?: string };

      if (!leadId) {
        res.status(400).json({ error: { message: 'Lead ID is required.' } });
        return;
      }

      let lead = await LeadListing.findById(leadId);
      let propertyDoc = null;

      if (!lead) {
        propertyDoc = await Property.findById(leadId);
        if (!propertyDoc) {
          res.status(404).json({ error: { message: 'Lead or Property listing not found.' } });
          return;
        }
      }

      const targetEmail = ownerEmail || (lead ? lead.email : propertyDoc?.contactEmail);
      if (!targetEmail) {
        res.status(400).json({ error: { message: 'Owner email address is required.' } });
        return;
      }

      const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;
      const claimExpiresAt = new Date(Date.now() + FOUR_DAYS_MS);

      if (lead) {
        if (!lead.claimToken) {
          lead.claimToken = Buffer.from(crypto.randomBytes(24)).toString('hex');
        }
        lead.claimExpiresAt = claimExpiresAt;
        const claimUrl = `${env.FRONTEND_URL}/claim-property?token=${lead.claimToken}`;

        await sendHostOutreachEmail({
          ownerEmail: targetEmail,
          propertyTitle: lead.title,
          city: lead.city,
          locality: lead.locality,
          claimUrl,
        });

        lead.status = 'INVITED';
        lead.invitedAt = new Date();
        lead.invitedEmail = targetEmail;
        if (ownerEmail) lead.email = ownerEmail;
        await lead.save();

        res.json({
          data: {
            message: `Outreach email sent successfully to ${targetEmail}`,
            lead,
            claimUrl,
            claimExpiresAt,
          },
        });
      } else if (propertyDoc) {
        if (!propertyDoc.claimToken) {
          propertyDoc.claimToken = Buffer.from(crypto.randomBytes(24)).toString('hex');
        }
        propertyDoc.claimExpiresAt = claimExpiresAt;
        propertyDoc.contactEmail = targetEmail;
        if (propertyDoc.ownerInfo) {
          propertyDoc.ownerInfo.email = targetEmail;
        }
        await propertyDoc.save();

        const claimUrl = `${env.FRONTEND_URL}/claim-property?token=${propertyDoc.claimToken}`;

        await sendHostOutreachEmail({
          ownerEmail: targetEmail,
          propertyTitle: propertyDoc.title,
          city: propertyDoc.city || 'Mumbai',
          locality: propertyDoc.locality || 'Downtown',
          claimUrl,
        });

        res.json({
          data: {
            message: `Outreach email sent successfully to ${targetEmail}`,
            lead: {
              _id: propertyDoc._id,
              title: propertyDoc.title,
              city: propertyDoc.city,
              email: targetEmail,
              status: 'INVITED',
            },
            claimUrl,
            claimExpiresAt,
          },
        });
      }
    } catch (error: any) {
      console.error('[Outreach ERROR] Failed importing lead:', error);
      res.status(500).json({ error: { message: error?.message || 'Failed to invite property owner.' } });
    }
  }
);

// ----------------------------------------------------------------------------
// 3. PUBLIC: Retrieve Property Claim Details by Token
// ----------------------------------------------------------------------------
outreachRouter.get('/leads/claim/:token', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    let lead = await LeadListing.findOne({ claimToken: token });
    let expiresAtDate: Date | undefined = undefined;

    if (lead) {
      expiresAtDate = lead.claimExpiresAt;
    } else {
      const prop = await Property.findOne({ claimToken: token });
      if (prop) {
        expiresAtDate = prop.claimExpiresAt;
        lead = {
          _id: prop._id,
          title: prop.title,
          propertyType: prop.propertyType,
          city: prop.city,
          locality: prop.locality,
          address: prop.address,
          phone: prop.phone || prop.contactPhone,
          email: prop.contactEmail,
          status: prop.claimed ? 'CLAIMED' : 'UNCLAIMED',
          claimToken: prop.claimToken,
          claimExpiresAt: prop.claimExpiresAt,
        } as any;
      }
    }

    if (!lead) {
      res.status(404).json({ error: { message: 'Invalid property claim link.' } });
      return;
    }

    // Check if token has expired after 4 days
    if (expiresAtDate && new Date() > new Date(expiresAtDate)) {
      res.status(410).json({
        error: {
          code: 'CLAIM_LINK_EXPIRED',
          message: 'This property claim invitation link has expired (claim links are valid for 4 days). Please contact the administrator for a new invitation link.',
        },
      });
      return;
    }

    res.json({ data: { lead } });
  } catch (error: any) {
    res.status(500).json({ error: { message: error?.message || 'Failed to fetch claim details.' } });
  }
});

// ----------------------------------------------------------------------------
// 4. AUTHENTICATED HOST: Claim Property & Link to Host Account
// ----------------------------------------------------------------------------
outreachRouter.post('/leads/claim/:token', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const userId = req.auth!.userId;

    let lead = await LeadListing.findOne({ claimToken: token });
    let propertyDoc = null;

    if (!lead) {
      propertyDoc = await Property.findOne({ claimToken: token });
    }

    if (!lead && !propertyDoc) {
      res.status(404).json({ error: { message: 'Invalid property claim link.' } });
      return;
    }

    const expiresAtDate = lead ? lead.claimExpiresAt : propertyDoc?.claimExpiresAt;
    if (expiresAtDate && new Date() > new Date(expiresAtDate)) {
      res.status(410).json({
        error: {
          code: 'CLAIM_LINK_EXPIRED',
          message: 'This property claim invitation link has expired (claim links are valid for 4 days). Please contact the administrator for a new invitation link.',
        },
      });
      return;
    }

    // Ensure user has a Host document
    let host = await Host.findOne({ user: userId });
    if (!host) {
      host = new Host({
        user: userId,
        businessName: lead ? lead.title : propertyDoc?.title,
        verificationStatus: 'unverified',
      });
      await host.save();
    }
    await User.findByIdAndUpdate(userId, { role: 'host' });

    if (lead) {
      if (lead.status === 'CLAIMED') {
        res.status(400).json({ error: { message: 'This property listing has already been claimed.' } });
        return;
      }

      const slug = `${lead.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
      const newProperty = new Property({
        host: host._id,
        title: lead.title,
        slug,
        propertyType: lead.propertyType || 'hotel',
        category: 'stay',
        city: lead.city,
        locality: lead.locality,
        state: 'Maharashtra',
        country: 'India',
        address: lead.address,
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        pricePerNight: 2000,
        currency: 'INR',
        description: `Verified stay property claimed by ${host.businessName || 'Host'}. Located in ${lead.locality}, ${lead.city}.`,
        amenities: ['Wifi', 'Air Conditioning', 'Power Backup'],
        isVerified: false,
        isPublished: false,
        verificationStatus: 'DRAFT',
        primaryImage: lead.primaryImage,
      });

      await newProperty.save();

      lead.status = 'CLAIMED';
      lead.claimedByHost = host._id;
      lead.claimedAt = new Date();
      await lead.save();

      res.json({
        data: {
          message: 'Property claimed successfully! Please proceed to Host KYC verification.',
          property: newProperty,
          host,
        },
      });
    } else if (propertyDoc) {
      propertyDoc.host = host._id;
      propertyDoc.claimed = true;
      propertyDoc.ownerId = host._id;
      await propertyDoc.save();

      res.json({
        data: {
          message: 'Property claimed successfully! Please proceed to Host KYC verification.',
          property: propertyDoc,
          host,
        },
      });
    }
  } catch (error: any) {
    console.error('[Claim ERROR] Failed claiming property:', error);
    res.status(500).json({ error: { message: error?.message || 'Failed to claim property listing.' } });
  }
});

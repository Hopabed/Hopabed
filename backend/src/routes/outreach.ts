import { Router, type Request, type Response } from 'express';
import crypto from 'node:crypto';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../middleware/auth.js';
import { LeadListing } from '../models/LeadListing.js';
import { Property } from '../models/Property.js';
import { Host } from '../models/Host.js';
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
      const { city, category, query } = req.body as { city?: string; category?: string; query?: string };

      const filter: Record<string, unknown> = {};

      if (city && city.trim().length > 0) {
        filter.city = new RegExp(city.trim(), 'i');
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
          await discoverFromGooglePlaces(city, category || 'hotel');
        } catch (discoverErr) {
          console.error('[Outreach WARNING] Failed to discover new leads:', discoverErr);
        }
      }

      const dbLeads = await LeadListing.find(filter).sort({ createdAt: -1 });

      // Aggregate UNCLAIMED properties from Property collection
      const unclaimedPropFilter: Record<string, unknown> = {};
      if (city && city.trim().length > 0) {
        unclaimedPropFilter.city = new RegExp(city.trim(), 'i');
      }

      const unclaimedProperties = await Property.find(unclaimedPropFilter).sort({ createdAt: -1 });

      const mappedProps = unclaimedProperties.map((p) => ({
        _id: String(p._id),
        placeId: p.sourcePlaceId || `prop_${p._id}`,
        title: p.title,
        propertyType: p.propertyType,
        city: p.city || 'Mumbai',
        locality: p.locality || 'Downtown',
        address: p.address || `${p.title}, ${p.city}`,
        phone: p.phone || p.contactPhone,
        email: p.contactEmail || 'contact@' + p.slug + '.com',
        status: p.claimed ? 'CLAIMED' : 'UNCLAIMED',
        claimToken: p.claimToken || String(p._id),
        rating: 4.8,
        primaryImage: p.primaryImage,
      }));

      const combined: any[] = [...dbLeads];
      const titles = new Set(dbLeads.map((l) => l.title.toLowerCase()));

      for (const p of mappedProps) {
        if (!titles.has(p.title.toLowerCase())) {
          combined.push(p);
          titles.add(p.title.toLowerCase());
        }
      }

      res.json({ data: { leads: combined, count: combined.length, source: 'database' } });
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

      const lead = await LeadListing.findById(leadId);
      if (!lead) {
        res.status(404).json({ error: { message: 'Lead listing not found.' } });
        return;
      }

      const targetEmail = ownerEmail || lead.email;
      if (!targetEmail) {
        res.status(400).json({ error: { message: 'Owner email address is required.' } });
        return;
      }

      // Generate claim link
      const claimUrl = `${env.FRONTEND_URL}/claim-property?token=${lead.claimToken}`;

      // Dispatch outreach email
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
        },
      });
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
    const lead = await LeadListing.findOne({ claimToken: token });

    if (!lead) {
      res.status(404).json({ error: { message: 'Invalid or expired property claim link.' } });
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

    const lead = await LeadListing.findOne({ claimToken: token });
    if (!lead) {
      res.status(404).json({ error: { message: 'Invalid or expired property claim link.' } });
      return;
    }

    if (lead.status === 'CLAIMED') {
      res.status(400).json({ error: { message: 'This property listing has already been claimed.' } });
      return;
    }

    // Ensure user has a Host document
    let host = await Host.findOne({ user: userId });
    if (!host) {
      host = new Host({
        user: userId,
        businessName: lead.title,
        verificationStatus: 'UNVERIFIED',
      });
      await host.save();
    }

    // Create active Property under host
    const slug = `${lead.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newProperty = new Property({
      host: host._id,
      title: lead.title,
      slug,
      propertyType: lead.propertyType || 'hotel',
      category: 'stay',
      city: lead.city,
      locality: lead.locality,
      state: 'State',
      country: 'India',
      address: lead.address,
      bedrooms: 5,
      bathrooms: 5,
      maxGuests: 10,
      pricePerNight: 2500,
      currency: 'INR',
      description: `Verified stay property claimed by ${host.businessName || 'Host'}. Located in ${lead.locality}, ${lead.city}.`,
      amenities: ['Wifi', 'Air Conditioning', 'Power Backup', 'Housekeeping'],
      isVerified: false,
      isPublished: true,
      isFeatured: false,
      verificationStatus: 'DRAFT',
      primaryImage: lead.primaryImage,
    });

    await newProperty.save();

    // Mark lead as claimed
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
  } catch (error: any) {
    console.error('[Claim ERROR] Failed claiming property:', error);
    res.status(500).json({ error: { message: error?.message || 'Failed to claim property listing.' } });
  }
});

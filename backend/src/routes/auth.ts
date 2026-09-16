import { Router } from 'express';
import crypto from 'node:crypto';

import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { createAccessToken, requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { issueAuthTokens, clearAuthCookies } from '../utils/authUtils.js';
import otpAuthRouter from './otpAuth.js';
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // 20 requests per 15 mins for auth routes
  message: { success: false, error: { message: 'Too many authentication attempts, please try again later.' } },
});

const router = Router();
router.use(authLimiter);
router.use('/', otpAuthRouter);
const googleClient = new OAuth2Client();

const credentialsSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});

function publicUser(user: {
  _id?: unknown;
  id?: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatarUrl?: string;
}) {
  return {
    id: String(user._id ?? user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
  };
}

router.post('/register', async (req, res, next) => {
  try {
    const input = credentialsSchema.extend({ name: z.string().trim().min(2).max(80) }).parse(req.body);
    const existingUser = await User.findOne({ email: input.email }).select('_id').lean();

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: { code: 'EMAIL_ALREADY_REGISTERED', message: 'An account with this email already exists.' },
      });
      return;
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await User.create({ name: input.name, email: input.email, passwordHash, tokenVersion: 0 });
    const payload = await issueAuthTokens(req, res, user);

    // Asynchronously dispatch welcome email (non-blocking)
    sendWelcomeEmail({ name: user.name, email: user.email }).catch((err) =>
      console.error('[AuthRoute] Welcome email send error:', err)
    );

    res.status(201).json({ success: true, data: { user: publicUser(user), ...payload } });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const input = credentialsSchema.omit({ name: true }).parse(req.body);
    const user = await User.findOne({ email: input.email }).select('+passwordHash');
    const passwordMatches = user?.passwordHash
      ? await bcrypt.compare(input.password, user.passwordHash)
      : false;

    if (!user || !passwordMatches) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' },
      });
      return;
    }

    const authPayload = await issueAuthTokens(req, res, user);
    res.json({ success: true, data: { user: publicUser(user), ...authPayload } });
  } catch (error) {
    next(error);
  }
});

router.post('/google', async (req, res, next) => {
  try {
    const credential = z.object({ credential: z.string().min(1) }).parse(req.body).credential;
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email || !payload.email_verified || !payload.name) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_GOOGLE_ACCOUNT', message: 'Google account verification failed.' },
      });
      return;
    }

    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }] }).select('+googleId');
    if (user && user.googleId && user.googleId !== payload.sub) {
      res.status(409).json({
        success: false,
        error: { code: 'GOOGLE_ACCOUNT_CONFLICT', message: 'This email is linked to another Google account.' },
      });
      return;
    }

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        authProvider: 'google',
        isEmailVerified: true,
        avatarUrl: payload.picture,
        tokenVersion: 0,
      });
    } else {
      if (!user.googleId) {
        user.googleId = payload.sub;
        user.authProvider = 'google';
      }
      user.isEmailVerified = true;
      if (payload.picture) user.avatarUrl = payload.picture;
      await user.save();
    }

    const authPayload = await issueAuthTokens(req, res, user);
    res.json({ success: true, data: { user: publicUser(user), ...authPayload } });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await User.findById(req.auth?.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'The authenticated account no longer exists.' },
      });
      return;
    }

    const adminEmails = ['mithagaris@gmail.com', 'admin@hopebed.in'];
    if (user.email && adminEmails.includes(user.email.toLowerCase()) && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    res.json({ success: true, data: { user: publicUser(user) } });
  } catch (error) {
    next(error);
  }
});

router.delete('/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, error: { message: 'User not found' } });
      return;
    }

    // Controlled anonymization (Right to Erasure)
    // We retain the User ObjectId to preserve relational integrity in Booking, Payment, and Invoice documents.
    user.name = '[DELETED_USER]';
    user.email = `deleted_${userId}@anonymized.hopebed.in`;
    user.phone = undefined;
    user.googleId = undefined;
    user.passwordHash = undefined;
    user.avatarUrl = undefined;
    user.tokenVersion += 1; // Invalidate all tokens

    await user.save();

    // Revoke all refresh tokens
    await RefreshToken.updateMany({ userId }, { $set: { revokedAt: new Date() } });

    // Optional: We could also update the Host profile if applicable, setting status to suspended/inactive
    clearAuthCookies(req, res);

    res.json({ success: true, message: 'Account and personal data successfully deleted or anonymized in compliance with data protection rules.' });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req: AuthenticatedRequest, res, next) => {
  try {
    // We don't requireAuth for logout just in case access token is already expired
    // but they want to clear cookies. We will clear them anyway.
    let userId = req.auth?.userId;
    
    // Revoke the specific refresh token
    const isMobile = req.header('x-client-type') === 'mobile';
    const refreshVal = isMobile ? req.body.refreshToken : req.cookies?.hopebed_refresh;
    if (refreshVal) {
      const [familyId] = refreshVal.split(':');
      if (familyId) {
        const rT = await RefreshToken.findOneAndUpdate(
          { familyId, revokedAt: { $exists: false } },
          { $set: { revokedAt: new Date() } }
        );
        if (rT && !userId) userId = rT.userId.toString();
      }
    }

    if (userId) {
      // Optional: global logout if user clicks "log out of all devices"
      if (req.body.global) {
        await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
        await RefreshToken.updateMany({ userId, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });
      }
    }

    clearAuthCookies(req, res);
    res.json({ success: true, data: { message: 'Logged out successfully.' } });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const isMobile = req.header('x-client-type') === 'mobile';
    const refreshVal = isMobile ? req.body.refreshToken : req.cookies?.hopebed_refresh;
    
    if (!refreshVal || typeof refreshVal !== 'string') {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No refresh token provided.' } });
      return;
    }
    
    const [familyId, rawRefresh] = refreshVal.split(':');
    if (!familyId || !rawRefresh) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token.' } });
      return;
    }

    const currentToken = await RefreshToken.findOne({ familyId }).sort({ createdAt: -1 });
    if (!currentToken) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid refresh session.' } });
      return;
    }

    const isValid = await bcrypt.compare(rawRefresh, currentToken.tokenHash);

    // If token is revoked but valid hash, this is token reuse (theft)
    if (isValid && currentToken.revokedAt) {
      await RefreshToken.updateMany({ userId: currentToken.userId }, { $set: { revokedAt: new Date() } });
      clearAuthCookies(req, res);
      res.status(401).json({ success: false, error: { code: 'THEFT_DETECTED', message: 'Session compromised.' } });
      return;
    }

    if (!isValid || currentToken.expiresAt < new Date()) {
      clearAuthCookies(req, res);
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token.' } });
      return;
    }

    const user = await User.findById(currentToken.userId);
    if (!user) {
      res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User no longer exists.' } });
      return;
    }

    // Revoke current
    currentToken.revokedAt = new Date();
    await currentToken.save();

    const payload = await issueAuthTokens(req, res, user);
    res.json({ success: true, data: { user: publicUser(user), ...payload } });
  } catch (error) {
    next(error);
  }
});

export default router;
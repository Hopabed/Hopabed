import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { createAccessToken, requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../services/emailService.js';
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
    const token = createAccessToken(user.id, user.role, user.tokenVersion);

    // Asynchronously dispatch welcome email (non-blocking)
    sendWelcomeEmail({ name: user.name, email: user.email }).catch((err) =>
      console.error('[AuthRoute] Welcome email send error:', err)
    );

    res.status(201).json({ success: true, data: { user: publicUser(user), token } });
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

    const token = createAccessToken(user.id, user.role, user.tokenVersion ?? 0);
    res.json({ success: true, data: { user: publicUser(user), token } });
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

    const token = createAccessToken(user.id, user.role, user.tokenVersion ?? 0);
    res.json({ success: true, data: { user: publicUser(user), token } });
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
router.post('/logout', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (req.auth?.userId) {
      await User.findByIdAndUpdate(req.auth.userId, { $inc: { tokenVersion: 1 } });
    }
    res.json({ success: true, data: { message: 'Logged out successfully.' } });
  } catch (error) {
    next(error);
  }
});

export default router;
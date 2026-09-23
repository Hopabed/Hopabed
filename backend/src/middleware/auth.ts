import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { getCookieOptions } from '../utils/authUtils.js';

export type UserRole = 'guest' | 'host' | 'admin';

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    role: UserRole;
  };
}

interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  tokenVersion: number;
}

export function createAccessToken(userId: string, role: UserRole, tokenVersion: number): string {
  return jwt.sign({ role, tokenVersion }, env.JWT_SECRET, {
    subject: userId,
    expiresIn: '15m',
  });
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  let token = req.cookies?.hopebed_access;

  if (!token) {
    const authorization = req.header('authorization');
    token = authorization?.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : undefined;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication is required.' },
    });
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
    if (!payload.sub || !['guest', 'host', 'admin'].includes(payload.role) || typeof payload.tokenVersion !== 'number') {
      throw new Error('Invalid access token payload.');
    }

    const user = await User.findById(payload.sub).select('tokenVersion role').lean();
    const currentVersion = user?.tokenVersion ?? 0;
    if (!user || currentVersion !== payload.tokenVersion) {
      console.error(`[Auth] User tokenVersion: ${currentVersion}, Payload tokenVersion: ${payload.tokenVersion}`);
      throw new Error('Session expired or user not found.');
    }

    req.auth = { userId: payload.sub, role: user.role as UserRole };
    requireCsrf(req, res, next);
  } catch (err) {
    console.error('[requireAuth Error]', err);
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'The authentication token is invalid or expired.' },
    });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const userRole = req.auth?.role?.toLowerCase();
    const normalizedRoles = roles.map((r) => r.toLowerCase());
    if (!req.auth || !userRole || !normalizedRoles.includes(userRole)) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied. Required role: ' + roles.join(' or ') },
      });
      return;
    }

    next();
  };
}

export function requireCsrf(req: Request, res: Response, next: NextFunction): void {
  // Only state-changing methods need CSRF protection
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  // If mobile client (no cookies), bypass CSRF token check
  if (req.header('x-client-type') === 'mobile') {
    next();
    return;
  }

  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.header('x-csrf-token');

  // Determine effective CSRF token (prefer cookie token, fallback to header, or generate new)
  const effectiveToken = cookieToken || headerToken || crypto.randomUUID();

  // Ensure cookie and header stay in sync for browser environment
  if (!cookieToken || cookieToken !== effectiveToken) {
    res.cookie('csrf_token', effectiveToken, { ...getCookieOptions(req, 7 * 24 * 60 * 60 * 1000), httpOnly: false });
  }

  // Expose active CSRF token back to client in response header
  res.setHeader('X-CSRF-Token', effectiveToken);

  next();
}
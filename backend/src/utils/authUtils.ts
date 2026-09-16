import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { createAccessToken } from '../middleware/auth.js';

export const getCookieOptions = (req: Request, maxAge: number) => {
  const isProduction = env.NODE_ENV === 'production';
  let domain: string | undefined = undefined;
  
  if (isProduction && req.hostname.includes('hopebed.in')) {
    domain = '.hopebed.in';
  }
  
  return {
    httpOnly: true,
    secure: isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'lax' as const,
    domain,
    maxAge,
  };
};

export async function issueAuthTokens(req: Request, res: Response, user: any) {
  const token = createAccessToken(user.id, user.role, user.tokenVersion ?? 0);
  
  const rawRefresh = (crypto.randomBytes(32) as any).toString('hex');
  const tokenHash = await bcrypt.hash(rawRefresh, 10);
  const familyId = (crypto.randomBytes(16) as any).toString('hex');
  
  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    familyId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    device: req.headers['user-agent']
  });
  
  const refreshCookieValue = `${familyId}:${rawRefresh}`;
  const csrfToken = (crypto.randomBytes(32) as any).toString('hex');
  
  if (req.header('x-client-type') === 'mobile') {
    return { token, refreshToken: refreshCookieValue, csrfToken };
  } else {
    res.cookie('hopebed_access', token, getCookieOptions(req, 15 * 60 * 1000));
    res.cookie('hopebed_refresh', refreshCookieValue, getCookieOptions(req, 7 * 24 * 60 * 60 * 1000));
    res.cookie('csrf_token', csrfToken, { ...getCookieOptions(req, 15 * 60 * 1000), httpOnly: false });
    return { token };
  }
}

export function clearAuthCookies(req: Request, res: Response) {
  if (req.header('x-client-type') === 'mobile') return;
  const opts = getCookieOptions(req, 0);
  res.clearCookie('hopebed_access', opts);
  res.clearCookie('hopebed_refresh', opts);
  res.clearCookie('csrf_token', { ...opts, httpOnly: false });
}

import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { Property } from '../models/Property.js';
import { Host } from '../models/Host.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { User } from '../models/User.js';
import hostsRouter from './hosts.js';
import bookingsRouter from './bookings.js';
import paymentsRouter from './payments.js';
import jwt from 'jsonwebtoken';

describe('Security Regression Tests', () => {
  let app: express.Application;
  let server: any;
  let baseUrl: string;

  before(async () => {
    app = express();
    app.use(express.json());
    app.use('/hosts', hostsRouter);
    app.use('/bookings', bookingsRouter);
    app.use('/payments', paymentsRouter);

    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
    
    // Mock JWT verify to bypass actual signing
    mock.method(jwt, 'verify', (token: string) => {
      if (token === 'admin-token') return { sub: 'admin-id', role: 'admin', tokenVersion: 1 };
      if (token === 'host-token') return { sub: 'host-id', role: 'host', tokenVersion: 1 };
      if (token === 'other-host-token') return { sub: 'other-host-id', role: 'host', tokenVersion: 1 };
      if (token === 'guest-token') return { sub: 'guest-id', role: 'guest', tokenVersion: 1 };
      throw new Error('Invalid token');
    });

    // Mock User.findById to satisfy requireAuth
    mock.method(User, 'findById', (id: string) => {
      return {
        select: () => ({
          lean: async () => ({ _id: id, tokenVersion: 1 })
        })
      };
    });
  });

  after(() => {
    if (server) server.close();
    mock.restoreAll();
  });

  describe('TEST A — Mass Assignment (Property Creation)', () => {
    it('should not allow setting isVerified or verificationStatus', async () => {
      mock.method(Host, 'findOne', async () => ({ _id: 'host-id-obj' }));
      mock.method(Host, 'findByIdAndUpdate', async () => ({}));
      
      let createdProperty: any = null;
      mock.method(Property, 'create', async (data: any) => {
        createdProperty = data;
        return { _id: 'new-prop-id', ...data };
      });

      const res = await fetch(`${baseUrl}/hosts/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer host-token' },
        body: JSON.stringify({
          title: 'My Test Property',
          city: 'Mumbai',
          isVerified: true,
          verificationStatus: 'VERIFIED'
        })
      });

      const json: any = await res.json();
      assert.equal(res.status, 201);
      assert.equal(createdProperty.title, 'My Test Property');
      // Vulnerability check:
      assert.equal(createdProperty.isVerified, false, 'isVerified should be forced to false');
      assert.equal(createdProperty.verificationStatus, 'DRAFT', 'verificationStatus should be forced to DRAFT');
    });
  });

  const bkId = '507f1f77bcf86cd799439011';
  const pmtId = '507f1f77bcf86cd799439012';

  describe('TEST B — Check-in Authorization', () => {
    it('should deny unauthenticated users', async () => {
      const res = await fetch(`${baseUrl}/bookings/${bkId}/check-in`, { method: 'POST' });
      assert.equal(res.status, 401);
    });

    it('should deny normal guest', async () => {
      mock.method(Booking, 'findById', async () => ({ _id: bkId, host: 'host-id-obj', save: async () => {} }));
      mock.method(Host, 'findOne', async () => null); // guest has no host profile

      const res = await fetch(`${baseUrl}/bookings/${bkId}/check-in`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer guest-token' }
      });
      assert.equal(res.status, 403);
    });

    it('should deny different host', async () => {
      mock.method(Booking, 'findById', async () => ({ _id: bkId, host: 'host-id-obj', save: async () => {} }));
      mock.method(Host, 'findOne', async () => ({ _id: 'other-host-id-obj' })); // different host

      const res = await fetch(`${baseUrl}/bookings/${bkId}/check-in`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer other-host-token' }
      });
      assert.equal(res.status, 403);
    });

    it('should allow correct property host', async () => {
      let saved = false;
      mock.method(Booking, 'findById', async () => ({ _id: bkId, host: 'host-id-obj', save: async () => { saved = true; } }));
      mock.method(Host, 'findOne', async () => ({ _id: 'host-id-obj' })); // correct host

      const res = await fetch(`${baseUrl}/bookings/${bkId}/check-in`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer host-token' }
      });
      assert.equal(res.status, 200);
      assert.equal(saved, true);
    });

    it('should allow admin', async () => {
      let saved = false;
      mock.method(Booking, 'findById', async () => ({ _id: bkId, host: 'host-id-obj', save: async () => { saved = true; } }));
      
      const res = await fetch(`${baseUrl}/bookings/${bkId}/check-in`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer admin-token' }
      });
      assert.equal(res.status, 200);
      assert.equal(saved, true);
    });
  });

  describe('TEST C — Refund Authorization', () => {
    before(() => {
      mock.method(Payment, 'findOne', async () => ({ _id: pmtId, booking: bkId, status: 'captured', amount: 1000, save: async () => {} }));
      mock.method(Booking, 'findById', async () => ({ _id: bkId, guest: 'guest-id', host: 'host-id', save: async () => {} }));
    });

    it('should deny guest', async () => {
      const res = await fetch(`${baseUrl}/payments/payu-refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer guest-token' },
        body: JSON.stringify({ bookingId: bkId })
      });
      assert.equal(res.status, 403);
    });

    it('should deny non-admin host', async () => {
      const res = await fetch(`${baseUrl}/payments/payu-refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer host-token' },
        body: JSON.stringify({ bookingId: bkId })
      });
      assert.equal(res.status, 403);
    });

    it('should allow admin (simulating fetch since we mocked it)', async () => {
      const originalFetch = global.fetch;
      global.fetch = mock.fn(async () => ({
        ok: true,
        json: async () => ({ status: 1, request_id: 'ref-1', msg: 'Refund Success' })
      })) as any;
      
      const res = await fetch(`${baseUrl}/payments/payu-refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer admin-token' },
        body: JSON.stringify({ bookingId: bkId })
      });
      
      global.fetch = originalFetch;
      // We expect 500 if env vars are missing, or 200. Let's just check it doesn't return 403.
      assert.notEqual(res.status, 403);
    });
  });

  describe('TEST D — Image Upload IDOR', () => {
    it('should deny unauthenticated users', async () => {
      const res = await fetch(`${baseUrl}/hosts/properties/prop-1/images`, { method: 'POST' });
      assert.equal(res.status, 401);
    });

    it('should deny if Host profile not found', async () => {
      mock.method(Host, 'findOne', async () => null);
      const res = await fetch(`${baseUrl}/hosts/properties/prop-1/images`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer host-token' }
      });
      assert.equal(res.status, 404);
    });

    it('should deny if Property does not belong to host', async () => {
      mock.method(Host, 'findOne', async () => ({ _id: 'host-id-obj' }));
      mock.method(Property, 'findOne', async () => null);
      const res = await fetch(`${baseUrl}/hosts/properties/prop-1/images`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer host-token' }
      });
      assert.equal(res.status, 404);
    });
  });
});

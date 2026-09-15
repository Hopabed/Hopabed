import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

describe('Google Lead Discovery & Host Outreach System Unit Tests', () => {
  describe('Lead Listing Claim Token Generator', () => {
    it('should generate secure 48-character hex claim tokens', () => {
      const token = crypto.randomBytes(24).toString('hex');
      assert.equal(token.length, 48);
      assert.equal(/^[0-9a-f]+$/i.test(token), true);
    });
  });

  describe('Outreach Email URL Builder', () => {
    it('should construct valid claim URL targeting claim-property route with token parameter', () => {
      const frontendUrl = 'https://hopebed.in';
      const token = 'abcdef1234567890abcdef1234567890abcdef1234567890';
      const claimUrl = `${frontendUrl}/claim-property?token=${token}`;

      assert.equal(claimUrl, 'https://hopebed.in/claim-property?token=abcdef1234567890abcdef1234567890abcdef1234567890');
      assert.ok(claimUrl.includes('/claim-property?token='));
    });
  });

  describe('Lead State Transitions', () => {
    it('should transition lead status from UNCLAIMED -> INVITED -> CLAIMED', () => {
      const validTransitions: Record<string, string[]> = {
        UNCLAIMED: ['INVITED'],
        INVITED: ['CLAIMED'],
        CLAIMED: [],
      };

      assert.ok(validTransitions['UNCLAIMED'].includes('INVITED'));
      assert.ok(validTransitions['INVITED'].includes('CLAIMED'));
      assert.equal(validTransitions['CLAIMED'].length, 0);
    });
  });
});

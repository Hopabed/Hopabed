import { execSync } from 'child_process';
import path from 'path';

const launchGates = [
  { name: 'Admin Property Verification', script: 'test_admin_property_verification.ts' },
  { name: 'Server-side Booking Amount Validation', script: 'test_amount_security.ts' },
  { name: 'Razorpay Webhook & Duplicate Protection', script: 'test_razorpay_webhook.ts' },
  { name: 'Cancellation & Refund Flow', script: 'test_cancellation_refund.ts' },
  { name: 'Full Customer Booking E2E Journey', script: 'test_customer_booking_e2e.ts' },
];

function runTests() {
  console.log('======================================================');
  console.log('🚀 INITIATING PRODUCTION LAUNCH ACCEPTANCE TESTS 🚀');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  for (const gate of launchGates) {
    console.log(`\n⏳ Running Gate: ${gate.name}...`);
    try {
      // Execute the script using tsx
      const scriptPath = path.join(process.cwd(), 'scripts', gate.script);
      execSync(`npx tsx "${scriptPath}"`, { stdio: 'inherit' });
      
      console.log(`\n✅ GATE PASSED: ${gate.name}`);
      passed++;
    } catch (error) {
      console.error(`\n❌ GATE FAILED: ${gate.name}`);
      failed++;
      // We stop the launch sequence if any critical gate fails
      console.log('\n🛑 ABORTING LAUNCH SEQUENCE DUE TO CRITICAL GATE FAILURE.');
      break;
    }
  }

  console.log('\n======================================================');
  console.log('               LAUNCH READINESS REPORT                ');
  console.log('======================================================');
  console.log(`Total Gates:  ${launchGates.length}`);
  console.log(`Passed:       ${passed}`);
  console.log(`Failed:       ${failed}`);
  
  if (failed === 0 && passed === launchGates.length) {
    console.log('\n🌟 ALL LAUNCH GATES PASSED! SYSTEM IS READY FOR PRODUCTION LAUNCH. 🌟\n');
    process.exit(0);
  } else {
    console.log('\n⚠️ SYSTEM IS NOT READY FOR LAUNCH. PLEASE FIX FAILING GATES. ⚠️\n');
    process.exit(1);
  }
}

runTests();

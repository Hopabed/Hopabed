import { env } from './src/config/env.js';
import Razorpay from 'razorpay';

async function testInit() {
  try {
    const razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID as string,
      key_secret: env.RAZORPAY_KEY_SECRET as string,
    });

    const order = await razorpay.orders.create({
      amount: 10000,
      currency: 'INR',
      receipt: 'test_receipt',
    });
    console.log('Order created:', order);
  } catch (err: any) {
    console.error('Razorpay Error:', err);
  }
  process.exit(0);
}

testInit().catch(console.error);

testInit().catch(console.error);

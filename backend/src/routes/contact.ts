import { Router } from 'express';
import { Schema } from 'mongoose';
import { getOrCreateModel } from '../models/modelUtils.js';

const router = Router();

export interface IContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  createdAt: Date;
}

const contactSchema = new Schema<IContactSubmission>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
  },
  { timestamps: true }
);

const ContactSubmission = getOrCreateModel<IContactSubmission>('ContactSubmission', contactSchema);

// POST /api/contact
router.post('/', async (req, res, next) => {
  try {
    const { name, email, subject, message, phone } = req.body;

    if (!name || !email || !subject || !message) {
      res.status(400).json({
        success: false,
        error: { message: 'Name, email, subject, and message are required.' },
      });
      return;
    }

    const contact = new ContactSubmission({
      name,
      email,
      subject,
      message,
      phone,
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Your request has been submitted successfully.',
      id: contact._id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

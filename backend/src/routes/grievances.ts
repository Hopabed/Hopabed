import { Router } from 'express';
import { Grievance } from '../models/Grievance.js';
import crypto from 'node:crypto';

const router = Router();

// POST /api/grievances
router.post('/', async (req, res, next) => {
  try {
    const { subject, description, contactEmail } = req.body;
    
    if (!subject || !description || !contactEmail) {
      res.status(400).json({ error: { message: 'Missing required fields' } });
      return;
    }

    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ticketId = `GRV-${randomStr}`;
    
    const grievance = new Grievance({
      ticketId,
      subject,
      description,
      contactEmail,
      status: 'open',
    });

    await grievance.save();

    res.status(201).json({ 
      message: 'Grievance submitted successfully. We will acknowledge within 48 hours.', 
      ticketId 
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/grievances/:ticketId
router.get('/:ticketId', async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const grievance = await Grievance.findOne({ ticketId });
    
    if (!grievance) {
      res.status(404).json({ error: { message: 'Ticket not found' } });
      return;
    }

    res.json({
      ticketId: grievance.ticketId,
      status: grievance.status,
      subject: grievance.subject,
      createdAt: grievance.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

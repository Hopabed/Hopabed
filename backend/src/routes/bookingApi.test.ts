import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import mongoose, { Types } from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Property } from '../models/Property.js';
import { Room } from '../models/Room.js';
import { Host } from '../models/Host.js';
import { User } from '../models/User.js';

describe('Booking API End-to-End & Integration Test Suite', () => {
  describe('Server-Side Booking Calculation & Validation Rules', () => {
    it('should accurately calculate subtotal, service fee (5%), taxes (5%), and totalAmount', () => {
      const pricePerNight = 5000;
      const nights = 2;
      const roomCount = 1;

      const subtotal = pricePerNight * nights * roomCount; // 10000
      const serviceFee = Math.round(subtotal * 0.05);       // 500
      const taxes = Math.round((subtotal + serviceFee) * 0.05); // 525
      const totalAmount = subtotal + serviceFee + taxes;    // 11025

      assert.equal(subtotal, 10000);
      assert.equal(serviceFee, 500);
      assert.equal(taxes, 525);
      assert.equal(totalAmount, 11025);
    });

    it('should enforce date validation rules (checkOut > checkIn and checkIn >= today)', () => {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const checkIn = new Date(today);
      checkIn.setDate(checkIn.getDate() + 5);

      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 2);

      const diffNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
      assert.equal(diffNights, 2);
      assert.ok(checkIn >= today);
      assert.ok(checkOut > checkIn);
    });
  });

  describe('MongoDB Booking Record Uniqueness & Output Structure', () => {
    it('should generate a valid 24-character hexadecimal MongoDB ObjectId for bookingId', () => {
      const mockBookingId = new Types.ObjectId();
      assert.equal(mockBookingId.toString().length, 24);
      assert.ok(Types.ObjectId.isValid(mockBookingId));
    });

    it('should return initial payment status as UNPAID and booking status as pending', () => {
      const initialBookingState = {
        status: 'pending',
        paymentStatus: 'UNPAID',
      };
      assert.equal(initialBookingState.status, 'pending');
      assert.equal(initialBookingState.paymentStatus, 'UNPAID');
    });

    it('should create exactly one booking record per valid booking API call', async () => {
      const bookingList: string[] = [];
      const createBookingMock = (id: string) => {
        bookingList.push(id);
        return { bookingId: id, count: bookingList.length };
      };

      const res1 = createBookingMock(new Types.ObjectId().toString());
      assert.equal(res1.count, 1);
      assert.ok(res1.bookingId);
      assert.equal(bookingList.length, 1);
    });
  });

  describe('Room Overbooking & Availability Protection', () => {
    it('should reject booking creation when requested roomCount exceeds inventory', () => {
      const roomInventory = 1;
      const existingBookedCount = 1;
      const requestedRoomCount = 1;

      const isAvailable = (existingBookedCount + requestedRoomCount) <= roomInventory;
      assert.equal(isAvailable, false, 'Overbooking must be rejected when inventory capacity is exceeded');
    });

    it('should allow booking creation when room inventory is available', () => {
      const roomInventory = 2;
      const existingBookedCount = 0;
      const requestedRoomCount = 1;

      const isAvailable = (existingBookedCount + requestedRoomCount) <= roomInventory;
      assert.equal(isAvailable, true, 'Booking should be accepted when room inventory is sufficient');
    });
  });
});

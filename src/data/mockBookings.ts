export type BookingItem = {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyImage: string;
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  totalNights: number;
  totalPrice: number;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
};

export const MOCK_BOOKINGS: BookingItem[] = [];

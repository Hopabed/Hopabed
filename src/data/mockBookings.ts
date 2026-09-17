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

export const MOCK_BOOKINGS: BookingItem[] = [
  {
    id: "HB-892401",
    propertyId: "goa-beachfront-villa",
    propertyName: "Sun & Sands Luxury Villa Anjuna",
    propertyImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80",
    city: "Goa",
    checkIn: "2026-10-15",
    checkOut: "2026-10-18",
    guests: 4,
    rooms: 2,
    totalNights: 3,
    totalPrice: 60473,
    status: "CONFIRMED",
    createdAt: "2026-09-10",
    guestName: "Guest User",
    guestEmail: "guest@hopebed.in",
    guestPhone: "+91 9876543210"
  },
  {
    id: "HB-783210",
    propertyId: "lake-view-resort",
    propertyName: "The Lake View Palace Resort",
    propertyImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
    city: "Udaipur",
    checkIn: "2026-08-01",
    checkOut: "2026-08-03",
    guests: 2,
    rooms: 1,
    totalNights: 2,
    totalPrice: 12317,
    status: "COMPLETED",
    createdAt: "2026-07-20",
    guestName: "Guest User",
    guestEmail: "guest@hopebed.in",
    guestPhone: "+91 9876543210"
  }
];

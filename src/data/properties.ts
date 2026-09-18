export type Property = {
  id: string;
  name: string;
  title?: string;
  location: string;
  locality: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  type: "hotels" | "villas" | "apartments" | "homestays" | "resorts";
  propertyType?: string;
  image: string;
  images: string[];
  primaryImage?: string;
  badge?: string;
  isVerified: boolean;
  description: string;
  address: string;
  amenities: string[];
  maxGuests: number;
  roomsCount: number;
  hostName: string;
  hostAvatar?: string;
  houseRules?: string[];
};

export const PROPERTIES: Property[] = [];

// Helper compatibility export
export const properties = PROPERTIES;

export function getPropertyById(id: string): Property | undefined {
  return PROPERTIES.find((property) => property.id === id);
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

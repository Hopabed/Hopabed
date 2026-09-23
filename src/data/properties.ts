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
  pricePerMonth?: number;
  isMonthlyAvailable?: boolean;
  messIncluded?: boolean;
  messMonthlyFee?: number;
  type: "hotels" | "villas" | "apartments" | "homestays" | "resorts" | "pg";
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
  rooms?: any[];
  hostName: string;
  hostAvatar?: string;
  houseRules?: string[];
};

export const PROPERTIES: Property[] = [];

export const FALLBACK_PROPERTY_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";

export function getValidImageUrl(url: string | undefined | null): string {
  if (!url || typeof url !== "string" || url.trim().length === 0) {
    return FALLBACK_PROPERTY_IMAGE;
  }
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }
  return `/${trimmed}`;
}

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

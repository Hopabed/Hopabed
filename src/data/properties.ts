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

export const PROPERTIES: Property[] = [
  {
    id: "prop-1",
    name: "Radisson Blu Stays Kharghar",
    title: "Radisson Blu Stays Kharghar",
    location: "Kharghar, Panvel",
    locality: "Kharghar",
    city: "Panvel",
    state: "Maharashtra",
    rating: 4.8,
    reviewCount: 142,
    pricePerNight: 3800,
    pricePerMonth: 45000,
    isMonthlyAvailable: true,
    type: "hotels",
    propertyType: "hotels",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80"
    ],
    primaryImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80",
    badge: "Verified Hotel",
    isVerified: true,
    description: "Premium verified hotel stays located in Kharghar with high-speed WiFi, swimming pool, and round-the-clock room service.",
    address: "Sector 14, Kharghar, Panvel, Maharashtra 410210",
    amenities: ["WiFi", "AC", "Swimming Pool", "Parking", "Restaurant", "24/7 Security"],
    maxGuests: 4,
    roomsCount: 45,
    hostName: "Radisson Hospitality",
  },
  {
    id: "prop-2",
    name: "Ocean View Villa CBD Belapur",
    title: "Ocean View Villa CBD Belapur",
    location: "CBD Belapur, Panvel",
    locality: "CBD Belapur",
    city: "Panvel",
    state: "Maharashtra",
    rating: 4.9,
    reviewCount: 98,
    pricePerNight: 7500,
    pricePerMonth: 95000,
    isMonthlyAvailable: true,
    type: "villas",
    propertyType: "villas",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80"
    ],
    primaryImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=900&q=80",
    badge: "Luxury Villa",
    isVerified: true,
    description: "Exclusive luxury villa with private lawn, deck, king bedrooms, and scenic hill views.",
    address: "Sector 11, CBD Belapur, Panvel, Maharashtra 400614",
    amenities: ["Private Pool", "Garden", "WiFi", "Barbecue", "Chef on Request"],
    maxGuests: 10,
    roomsCount: 4,
    hostName: "Hopebed Luxury Collection",
  },
  {
    id: "prop-3",
    name: "Capital Co-Living & PG",
    title: "Capital Co-Living & PG",
    location: "Vashi, Navi Mumbai",
    locality: "Vashi",
    city: "Navi Mumbai",
    state: "Maharashtra",
    rating: 4.7,
    reviewCount: 215,
    pricePerNight: 999,
    pricePerMonth: 12500,
    isMonthlyAvailable: true,
    messIncluded: true,
    messMonthlyFee: 3000,
    type: "pg",
    propertyType: "pg",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"
    ],
    primaryImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80",
    badge: "Verified PG",
    isVerified: true,
    description: "Fully furnished PG & long-stay co-living spaces for working professionals & students with daily meals.",
    address: "Sector 17, Vashi, Navi Mumbai, Maharashtra 400703",
    amenities: ["High-speed WiFi", "Daily Meals", "Laundry", "Housekeeping", "Biometric Entry"],
    maxGuests: 2,
    roomsCount: 30,
    hostName: "Capital Stays",
  },
  {
    id: "prop-4",
    name: "Presidential Executive Suites",
    title: "Presidential Executive Suites",
    location: "Vashi, Panvel",
    locality: "Vashi",
    city: "Panvel",
    state: "Maharashtra",
    rating: 4.8,
    reviewCount: 76,
    pricePerNight: 4200,
    pricePerMonth: 55000,
    isMonthlyAvailable: true,
    type: "apartments",
    propertyType: "apartments",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80"
    ],
    primaryImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=80",
    badge: "Serviced Apartment",
    isVerified: true,
    description: "Spacious serviced studio and 2BHK apartments with modern kitchenettes and workspace.",
    address: "Sector 30A, Vashi, Panvel, Maharashtra 400703",
    amenities: ["Kitchenette", "Washing Machine", "Gym", "Power Backup", "Covered Parking"],
    maxGuests: 4,
    roomsCount: 15,
    hostName: "Presidential Stays",
  },
  {
    id: "prop-5",
    name: "Greenwood Heritage Homestay",
    title: "Greenwood Heritage Homestay",
    location: "Lonavala, Maharashtra",
    locality: "Khandala",
    city: "Lonavala",
    state: "Maharashtra",
    rating: 4.9,
    reviewCount: 164,
    pricePerNight: 5500,
    pricePerMonth: 65000,
    isMonthlyAvailable: true,
    type: "homestays",
    propertyType: "homestays",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80"
    ],
    primaryImage: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80",
    badge: "Heritage Homestay",
    isVerified: true,
    description: "Peaceful hill station homestay surrounded by lush greenery, homemade Maharashtrian meals, and campfire deck.",
    address: "Old Mumbai-Pune Highway, Lonavala, Maharashtra 410401",
    amenities: ["Home Cooked Meals", "Garden Lawn", "Mountain View", "Fireplace", "Pet Friendly"],
    maxGuests: 6,
    roomsCount: 5,
    hostName: "Sharma Family",
  },
  {
    id: "prop-6",
    name: "Whispering Palms Beach Resort",
    title: "Whispering Palms Beach Resort",
    location: "Alibaug, Maharashtra",
    locality: "Nagaon Beach",
    city: "Alibaug",
    state: "Maharashtra",
    rating: 4.8,
    reviewCount: 112,
    pricePerNight: 6200,
    pricePerMonth: 78000,
    isMonthlyAvailable: true,
    type: "resorts",
    propertyType: "resorts",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80"
    ],
    primaryImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=80",
    badge: "Beach Resort",
    isVerified: true,
    description: "Beachfront resort with coconut groves, outdoor swimming pool, and seafood dining.",
    address: "Nagaon Beach Road, Alibaug, Maharashtra 402204",
    amenities: ["Beach Access", "Pool", "Spa", "Seafood Restaurant", "Water Sports"],
    maxGuests: 4,
    roomsCount: 22,
    hostName: "Whispering Palms",
  }
];

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

import { getPropertyById, PROPERTIES, Property } from "@/data/properties";
import { PropertyDetailClient } from "@/components/PropertyDetailClient";
import { getPropertyDetails } from "@/lib/api";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return PROPERTIES.map((p) => ({
    id: p.id,
  }));
}

export default async function LegacyStayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let property = getPropertyById(id);

  if (!property) {
    try {
      const details = await getPropertyDetails(id);
      property = {
        id: details.id,
        name: details.title,
        title: details.title,
        location: `${details.locality || details.city}, ${details.city}`,
        locality: details.locality || details.city,
        city: details.city,
        state: "India",
        rating: details.rating || 4.8,
        reviewCount: 18,
        pricePerNight: details.pricePerNight || (details.rooms?.[0]?.pricePerNight) || 2000,
        type: (details.propertyType?.toLowerCase() || "hotels") as any,
        propertyType: details.propertyType || "Hotel",
        image: details.primaryImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        images: [
          details.primaryImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80"
        ],
        badge: details.isVerified ? "Verified" : undefined,
        isVerified: details.isVerified !== false,
        description: details.description || "Beautiful verified stay.",
        address: details.address || `${details.locality || details.city}, ${details.city}`,
        amenities: details.amenities?.length ? details.amenities : ["WiFi", "AC", "Power Backup", "Housekeeping"],
        maxGuests: details.rooms?.[0]?.capacity || 4,
        roomsCount: details.rooms?.length || 1,
        hostName: "Hopebed Verified Host",
        hostAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        houseRules: details.houseRules || ["Check-in after 12:00 PM", "Check-out before 11:00 AM", "Govt ID required at check-in"],
      };
    } catch {
      notFound();
    }
  }

  return <PropertyDetailClient property={property} />;
}


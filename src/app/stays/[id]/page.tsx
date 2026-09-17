import { getPropertyById, PROPERTIES } from "@/data/properties";
import { PropertyDetailClient } from "@/components/PropertyDetailClient";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return PROPERTIES.map((p) => ({
    id: p.id,
  }));
}

export default async function StayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const property = getPropertyById(id);

  if (!property) {
    notFound();
  }

  return <PropertyDetailClient property={property} />;
}

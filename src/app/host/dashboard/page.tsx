"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatInr } from "@/data/properties";
import { CITIES } from "@/data/cities";
import { getHostProperties, createProperty, uploadPropertyImage } from "@/lib/api";
import {
  Building,
  PlusCircle,
  ShieldCheck,
  Trash2,
  TrendingUp,
  MapPin,
  X,
  UserCheck,
} from "lucide-react";
import Image from "next/image";
import { AuthModal } from "@/components/AuthModal";

export default function HostDashboardPage() {
  const { user, openAuthModal } = useAuth();

  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [state, setState] = useState("Maharashtra");
  const [type, setType] = useState("hotel");
  const [pricePerNight, setPricePerNight] = useState(3500);
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [amenitiesInput, setAmenitiesInput] = useState("WiFi, AC, Breakfast, Parking");

  useEffect(() => {
    if (user?.role === "HOST") {
      getHostProperties()
        .then((data) => setProperties(data || []))
        .catch((err) => console.error("Failed to load properties", err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <main className="container-page py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-brand mb-4">
          <UserCheck className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Sign in to view Host Dashboard</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
          Manage your listed properties, monitor verification status, and add new stay listings.
        </p>
        <button
          onClick={openAuthModal}
          className="mt-6 rounded-2xl bg-brand px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-brand-dark transition-all"
        >
          Sign In as Host
        </button>
        <AuthModal />
      </main>
    );
  }

  const handleAddPropertySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const amenitiesArr = amenitiesInput.split(",").map((s) => s.trim()).filter(Boolean);
      
      const newProperty = await createProperty({
        title: name,
        propertyType: type,
        city,
        state,
        pricePerNight: Number(pricePerNight),
        description,
        amenities: amenitiesArr,
      });

      if (imageFile && newProperty._id) {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile);
        reader.onload = async () => {
          const base64 = reader.result as string;
          try {
            await uploadPropertyImage(newProperty._id, {
              originalFilename: imageFile.name,
              mimeType: imageFile.type,
              fileBase64: base64,
              isPrimary: true
            });
            // Refresh properties after image upload
            const updated = await getHostProperties();
            setProperties(updated || []);
          } catch (imgErr) {
            console.error("Image upload failed", imgErr);
            alert("Property created, but image upload failed.");
            setProperties(prev => [newProperty, ...prev]);
          }
        };
      } else {
        setProperties(prev => [newProperty, ...prev]);
      }

      setIsAddModalOpen(false);
      setName("");
      setDescription("");
      setImageFile(null);
    } catch (error) {
      console.error("Failed to create property", error);
      alert("Failed to create property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalVerifiedCount = properties.filter((p) => p.isVerified).length;

  return (
    <main className="bg-gray-50 min-h-screen py-10">
      <div className="container-page space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900">Host Dashboard</h1>
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
                Host Mode Active
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Manage listings for {user.name} ({user.email})</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-2xl bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand/25 hover:bg-brand-dark transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="h-5 w-5" /> Add New Property Listing
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Listings</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{properties.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-brand">
              <Building className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Verified Stays</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-1">{totalVerifiedCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Estimated Monthly Earnings</p>
              <p className="text-3xl font-extrabold text-brand mt-1">{formatInr(0)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Property List Section */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-xl font-extrabold text-gray-900">Your Property Inventory</h2>
          </div>

          {isLoading ? (
            <p className="text-sm text-gray-500 py-10 text-center">Loading properties...</p>
          ) : properties.length === 0 ? (
            <p className="text-sm text-gray-500 py-10 text-center">You haven't listed any properties yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div
                  key={property._id || property.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full bg-gray-100">
                      {property.primaryImage || property.image ? (
                        <Image src={property.primaryImage || property.image} alt={property.title || property.name} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
                          <Building className="h-10 w-10" />
                        </div>
                      )}
                      
                      {property.isVerified ? (
                        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                          <ShieldCheck className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                          {property.verificationStatus || 'Pending Verification'}
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-2">
                      <h3 className="font-bold text-gray-900 line-clamp-1">{property.title || property.name}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-brand" /> {property.city}, {property.state}
                      </p>
                      <p className="text-sm font-extrabold text-brand">{formatInr(property.pricePerNight || 0)} / night</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add New Property Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <Building className="h-5 w-5 text-brand" /> Add Property Listing
              </h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddPropertySubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Property Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Sea View Villa Anjuna"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium outline-none bg-white"
                  >
                    {CITIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Property Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium outline-none bg-white"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="villa">Villa</option>
                    <option value="apartment">Apartment</option>
                    <option value="homestay">Homestay</option>
                    <option value="resort">Resort</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Price Per Night (₹)</label>
                <input
                  type="number"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(Number(e.target.value))}
                  required
                  step="500"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Property Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Amenities (Comma separated)</label>
                <input
                  type="text"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Describe your property details..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium outline-none focus:border-brand"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-brand py-3.5 text-center text-sm font-extrabold text-white shadow-lg hover:bg-brand-dark transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Creating Listing..." : "Create Listing Now"}
              </button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}

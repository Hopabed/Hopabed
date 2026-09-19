"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { formatInr, FALLBACK_PROPERTY_IMAGE, getValidImageUrl } from "@/data/properties";
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
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AuthModal } from "@/components/AuthModal";

export default function HostDashboardPage() {
  const { user, openAuthModal } = useAuth();

  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isHost = user && (user.role?.toLowerCase() === "host" || user.role?.toLowerCase() === "admin");

  useEffect(() => {
    if (user && isHost) {
      getHostProperties()
        .then((data) => setProperties(data || []))
        .catch((err) => console.error("Failed to load properties", err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user, isHost]);

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
          className="mt-6 rounded-2xl bg-brand px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-brand-dark transition-all cursor-pointer"
        >
          Sign In
        </button>
      </main>
    );
  }

  if (user && !isHost) {
    return (
      <main className="container-page py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4">
          <Building className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Host Account Required</h1>
        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
          You are currently signed in with a Guest Account ({user.email}). Register as a Host to list stay properties and access the Host Dashboard.
        </p>
        <Link
          href="/host/onboarding"
          className="mt-6 inline-block rounded-2xl bg-brand px-8 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-brand-dark transition-all"
        >
          Register as a Host
        </Link>
      </main>
    );
  }


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

          <Link
            href="/host/onboarding"
            className="rounded-2xl bg-brand px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-brand/25 hover:bg-brand-dark transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="h-5 w-5" /> Add New Property Listing
          </Link>
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
                <Link
                  key={property._id || property.id}
                  href={`/host/onboarding?propertyId=${property._id || property.id}`}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                      <img
                        src={getValidImageUrl(property.primaryImage || property.image || (property.images && property.images[0]))}
                        alt={property.title || property.name || "Hopebed Property"}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_PROPERTY_IMAGE;
                        }}
                      />
                      
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
                      {property.pricePerNight ? (
                        <p className="text-sm font-extrabold text-brand">{formatInr(property.pricePerNight)} / night</p>
                      ) : (
                        <p className="text-sm font-extrabold text-gray-400">Price based on rooms</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>



    </main>
  );
}

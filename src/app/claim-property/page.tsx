"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuthModal } from "@/components/AuthProvider";
import { getClaimPropertyDetails, claimPropertyByToken } from "@/lib/api";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Star,
  Loader2,
  Sparkles,
  ArrowRight,
  Shield,
  HelpCircle,
} from "lucide-react";

interface Lead {
  _id: string;
  title: string;
  propertyType: string;
  city: string;
  locality: string;
  address: string;
  phone?: string;
  email?: string;
  rating?: number;
  primaryImage?: string;
  status: string;
}

function ClaimPropertyContent() {
  const { user, openAuth } = useAuthModal();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMsg("Property claim token is missing in URL.");
      setLoading(false);
      return;
    }

    getClaimPropertyDetails(token)
      .then((data) => setLead(data as unknown as Lead))
      .catch((err: unknown) => {
        setErrorMsg(err instanceof Error ? err.message : "Invalid or expired property claim link.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleClaim = async () => {
    if (!token) return;
    if (!user) {
      openAuth({ isOwnerFlow: true });
      return;
    }

    setClaiming(true);
    setErrorMsg("");
    try {
      const res = (await claimPropertyByToken(token)) as { message?: string };
      setSuccessMsg(res.message || "Property claimed successfully!");
      setTimeout(() => {
        router.push("/host/verification");
      }, 1500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to claim property.");
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-brand" />
        <p className="text-sm font-semibold text-muted">Retrieving property details...</p>
      </div>
    );
  }

  if (errorMsg && !lead) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-ink-soft">Property Claim</h1>
        <p className="mt-2 text-sm text-red-600 font-medium">{errorMsg}</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-xs font-bold text-white transition hover:bg-brand-dark"
        >
          Return to Hopebed Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Title */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-brand">
          <Sparkles className="h-3.5 w-3.5" /> Official Property Claim Portal
        </span>
        <h1 className="mt-3 text-3xl font-bold text-ink-soft">Are you the Owner or Manager?</h1>
        <p className="mt-2 text-sm text-muted">
          Claim your property listing on Hopebed to accept zero-commission stay bookings and complete host identity verification.
        </p>
      </div>

      {successMsg && (
        <div className="mb-8 rounded-2xl bg-green-50 p-5 text-sm font-bold text-green-800 border border-green-200 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
          {successMsg} Redirecting to Host Verification Portal...
        </div>
      )}

      {errorMsg && (
        <div className="mb-8 rounded-2xl bg-red-50 p-5 text-sm text-red-700 border border-red-200">
          {errorMsg}
        </div>
      )}

      {lead && (
        <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-md">
          {/* Card Image */}
          <div className="relative h-64 w-full bg-canvas">
            <Image
              src={lead.primaryImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80"}
              alt={lead.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 text-white">
              <span className="inline-block rounded-full bg-brand px-3 py-0.5 text-xs font-bold uppercase tracking-wider mb-1">
                {lead.propertyType}
              </span>
              <h2 className="text-2xl font-bold">{lead.title}</h2>
              <p className="text-xs text-white/90 flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-brand" /> {lead.address}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 text-xs font-semibold">
              <div className="rounded-2xl bg-canvas p-4 border border-gray-100">
                <span className="text-muted block text-[11px]">Location</span>
                <span className="text-ink-soft text-sm font-bold">{lead.locality}, {lead.city}</span>
              </div>

              <div className="rounded-2xl bg-canvas p-4 border border-gray-100">
                <span className="text-muted block text-[11px]">Google Rating</span>
                <span className="text-amber-800 text-sm font-bold flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {lead.rating || 4.8} / 5.0
                </span>
              </div>
            </div>

            {/* Benefits */}
            <div className="rounded-2xl border border-brand/20 bg-brand/5 p-5">
              <h3 className="font-bold text-sm text-ink-soft mb-2 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-brand" /> What happens after claiming?
              </h3>
              <ul className="space-y-2 text-xs text-muted">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0" /> Link this listing directly to your Host Dashboard.
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0" /> Complete 1-minute Host KYC Verification (Govt ID + PAN).
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0" /> Start accepting zero-commission stay bookings & stay passes.
                </li>
              </ul>
            </div>

            {/* Claim Action Button */}
            <div className="pt-2">
              {user ? (
                <button
                  type="button"
                  onClick={handleClaim}
                  disabled={claiming}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-4 text-sm font-bold text-white shadow-md transition hover:bg-brand-dark disabled:opacity-70"
                >
                  {claiming ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Claiming Property Listing...
                    </>
                  ) : (
                    <>
                      <Building2 className="h-5 w-5" /> Claim Listing & Start Verification <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              ) : (
                <div className="text-center space-y-3">
                  <button
                    type="button"
                    onClick={() => openAuth({ isOwnerFlow: true })}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-brand px-6 py-4 text-sm font-bold text-white shadow-md transition hover:bg-brand-dark"
                  >
                    Log In / Sign Up to Claim Property <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="text-xs text-muted">Sign in or register a new host account to claim ownership.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClaimPropertyPage() {
  return (
    <Suspense fallback={<p className="px-6 py-20 text-center text-xs font-semibold text-muted">Loading claim portal...</p>}>
      <ClaimPropertyContent />
    </Suspense>
  );
}

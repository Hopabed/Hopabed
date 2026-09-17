"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { verifyStayPass } from "@/lib/api";
import { useAuthModal } from "@/components/AuthProvider";
import { CheckCircle2, AlertCircle, Loader2, QrCode, ScanLine, Clock } from "lucide-react";
import Link from "next/link";

export default function QRScanPage() {
  const { user } = useAuthModal();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error" | "warning">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [manualInput, setManualInput] = useState("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!user || user.role !== "host") return;

    // Initialize scanner
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
      /* verbose= */ false
    );
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        // Only trigger once per scan
        if (status !== "idle") return;
        handleVerification(decodedText);
      },
      (error) => {
        // Ignore normal scanning errors (e.g. no QR detected yet)
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [user]);

  const handleVerification = async (bookingId: string) => {
    if (!bookingId) return;
    setStatus("verifying");
    setScanResult(bookingId);
    setBookingDetails(null);

    // Pause scanner if active
    if (scannerRef.current) {
      try { scannerRef.current.pause(true); } catch (e) {}
    }

    try {
      const res = await verifyStayPass(bookingId);
      setBookingDetails(res.booking);
      setStatus("success");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to verify Stay Pass.");
      if (err.message?.includes("cancelled") || err.message?.includes("unpaid") || err.message?.includes("already checked")) {
        setStatus("warning");
      } else {
        setStatus("error");
      }
    }
  };

  const resetScanner = () => {
    setStatus("idle");
    setScanResult(null);
    setErrorMessage("");
    setManualInput("");
    if (scannerRef.current) {
      try { scannerRef.current.resume(); } catch (e) {}
    }
  };

  if (!user || user.role !== "host") {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="mb-4 text-3xl font-bold text-ink">Host Access Only</h1>
        <p className="text-muted">You must be logged in as a host to access the scanner.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-soft">Scan Stay Pass</h1>
          <p className="text-sm text-muted">Scan the guest&apos;s QR code to verify booking and check them in.</p>
        </div>
        <Link
          href="/host"
          className="text-sm font-semibold text-brand hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>

      {status === "idle" && (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div id="qr-reader" className="w-full"></div>
          
          <div className="border-t border-border p-6 text-center">
            <p className="mb-4 text-sm font-semibold text-muted uppercase tracking-wide">Or Enter Booking ID Manually</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 64a8b...123"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-canvas px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
              <button
                onClick={() => handleVerification(manualInput)}
                disabled={!manualInput}
                className="rounded-xl bg-brand px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-50"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {status === "verifying" && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-brand" />
          <h2 className="text-xl font-semibold text-ink-soft">Verifying Stay Pass...</h2>
          <p className="mt-2 text-sm text-muted break-all">ID: {scanResult}</p>
        </div>
      )}

      {status === "success" && bookingDetails && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-green-800">Valid Stay Pass</h2>
          <p className="mt-1 text-green-700">Guest has been successfully checked in.</p>
          
          <div className="mt-6 rounded-xl bg-white p-4 text-left border border-green-100 shadow-sm">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Guest Details</p>
            <p className="text-lg font-bold text-ink-soft">{bookingDetails.guest?.name || "Guest"}</p>
            <p className="text-sm text-muted mb-4">{bookingDetails.guest?.email}</p>
            
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <p className="text-xs text-muted">Check-In Date</p>
                <p className="font-semibold">{new Date(bookingDetails.checkIn).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Check-Out Date</p>
                <p className="font-semibold">{new Date(bookingDetails.checkOut).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <button
            onClick={resetScanner}
            className="mt-6 w-full rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            Scan Next Pass
          </button>
        </div>
      )}

      {(status === "error" || status === "warning") && (
        <div className={`rounded-2xl border p-8 text-center shadow-sm ${
          status === "error" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"
        }`}>
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-4 ${
            status === "error" ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"
          }`}>
            {status === "error" ? <AlertCircle className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
          </div>
          <h2 className={`text-2xl font-bold ${
            status === "error" ? "text-red-800" : "text-amber-800"
          }`}>
            {status === "error" ? "Invalid Stay Pass" : "Check-in Not Allowed"}
          </h2>
          <p className={`mt-2 font-medium ${
            status === "error" ? "text-red-700" : "text-amber-700"
          }`}>
            {errorMessage}
          </p>

          <button
            onClick={resetScanner}
            className={`mt-8 w-full rounded-xl px-6 py-3 font-semibold text-white transition ${
              status === "error" 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

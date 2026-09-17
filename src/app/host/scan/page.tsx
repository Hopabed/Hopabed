"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { verifyStayPass } from "@/lib/api";
import { useAuthModal } from "@/components/AuthProvider";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function QRScanPage() {
  const { user } = useAuthModal();

  const [scanResult, setScanResult] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const [status, setStatus] = useState<
    "idle" | "verifying" | "success" | "error" | "warning"
  >("idle");

  const [errorMessage, setErrorMessage] = useState("");
  const [manualInput, setManualInput] = useState("");

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!user || user.role !== "host") return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
        aspectRatio: 1.0,
      },
      false
    );

    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        handleVerification(decodedText);
      },
      () => {
        // Ignore normal QR scanning errors.
      }
    );

    return () => {
      scanner.clear().catch(console.error);
      scannerRef.current = null;
    };
  }, [user]);

  const handleVerification = async (bookingId: string) => {
    if (!bookingId.trim()) return;

    if (status !== "idle") return;

    setStatus("verifying");
    setScanResult(bookingId);
    setBookingDetails(null);
    setErrorMessage("");

    if (scannerRef.current) {
      try {
        scannerRef.current.pause(true);
      } catch {
        // Scanner may already be paused/stopped.
      }
    }

    try {
      const res = await verifyStayPass(bookingId);

      // verifyStayPass already returns the booking details directly.
      setBookingDetails(res);

      setStatus("success");
    } catch (err: any) {
      const message =
        err?.message || "Failed to verify Stay Pass.";

      setErrorMessage(message);

      if (
        message.toLowerCase().includes("cancelled") ||
        message.toLowerCase().includes("unpaid") ||
        message.toLowerCase().includes("already checked")
      ) {
        setStatus("warning");
      } else {
        setStatus("error");
      }
    }
  };

  const resetScanner = () => {
    setStatus("idle");
    setScanResult(null);
    setBookingDetails(null);
    setErrorMessage("");
    setManualInput("");

    if (scannerRef.current) {
      try {
        scannerRef.current.resume();
      } catch {
        // Scanner may already be running.
      }
    }
  };

  if (!user || user.role !== "host") {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="mb-4 text-3xl font-bold text-ink">
          Host Access Only
        </h1>

        <p className="text-muted">
          You must be logged in as a host to access the scanner.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-soft">
            Scan Stay Pass
          </h1>

          <p className="text-sm text-muted">
            Scan the guest&apos;s QR code to verify booking and check them in.
          </p>
        </div>

        <Link
          href="/host"
          className="text-sm font-semibold text-brand hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Scanner */}
      {status === "idle" && (
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div
            id="qr-reader"
            className="w-full"
          />

          <div className="border-t border-border p-6 text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
              Or Enter Booking ID Manually
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 64a8b...123"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && manualInput.trim()) {
                    handleVerification(manualInput);
                  }
                }}
                className="flex-1 rounded-xl border border-border bg-canvas px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />

              <button
                onClick={() => handleVerification(manualInput)}
                disabled={!manualInput.trim()}
                className="rounded-xl bg-brand px-6 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verifying */}
      {status === "verifying" && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white p-12 text-center shadow-sm">
          <Loader2 className="mb-4 h-12 w-12 animate-spin text-brand" />

          <h2 className="text-xl font-semibold text-ink-soft">
            Verifying Stay Pass...
          </h2>

          <p className="mt-2 break-all text-sm text-muted">
            ID: {scanResult}
          </p>
        </div>
      )}

      {/* Success */}
      {status === "success" && bookingDetails && (
        <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h2 className="text-2xl font-bold text-green-800">
            Valid Stay Pass
          </h2>

          <p className="mt-1 text-green-700">
            Guest has been successfully checked in.
          </p>

          {/* Guest Details */}
          <div className="mt-6 rounded-xl border border-green-100 bg-white p-4 text-left shadow-sm">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Guest Details
            </p>

            <p className="text-lg font-bold text-ink-soft">
              {bookingDetails.guest?.name ||
                bookingDetails.guestName ||
                "Guest"}
            </p>

            <p className="mb-4 text-sm text-muted">
              {bookingDetails.guest?.email ||
                bookingDetails.guestEmail ||
                ""}
            </p>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <div>
                <p className="text-xs text-muted">
                  Check-In Date
                </p>

                <p className="font-semibold">
                  {bookingDetails.checkIn
                    ? new Date(
                        bookingDetails.checkIn
                      ).toLocaleDateString()
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Check-Out Date
                </p>

                <p className="font-semibold">
                  {bookingDetails.checkOut
                    ? new Date(
                        bookingDetails.checkOut
                      ).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>

            {/* Property */}
            {(bookingDetails.propertyTitle ||
              bookingDetails.propertyAddress) && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs text-muted">
                  Property
                </p>

                <p className="font-semibold text-ink-soft">
                  {bookingDetails.propertyTitle ||
                    "Hopebed Property"}
                </p>

                {bookingDetails.propertyAddress && (
                  <p className="mt-1 text-sm text-muted">
                    {bookingDetails.propertyAddress}
                  </p>
                )}
              </div>
            )}

            {/* Room */}
            {(bookingDetails.roomName ||
              bookingDetails.roomType) && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs text-muted">
                  Room
                </p>

                <p className="font-semibold text-ink-soft">
                  {bookingDetails.roomName ||
                    bookingDetails.roomType ||
                    "—"}
                </p>
              </div>
            )}

            {/* Booking Status */}
            {bookingDetails.status && (
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs text-muted">
                  Booking Status
                </p>

                <p className="font-semibold text-green-700">
                  {bookingDetails.status}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={resetScanner}
            className="mt-6 w-full rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            Scan Next Pass
          </button>
        </div>
      )}

      {/* Error / Warning */}
      {(status === "error" || status === "warning") && (
        <div
          className={`rounded-2xl border p-8 text-center shadow-sm ${
            status === "error"
              ? "border-red-200 bg-red-50"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
              status === "error"
                ? "bg-red-100 text-red-600"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            {status === "error" ? (
              <AlertCircle className="h-8 w-8" />
            ) : (
              <Clock className="h-8 w-8" />
            )}
          </div>

          <h2
            className={`text-2xl font-bold ${
              status === "error"
                ? "text-red-800"
                : "text-amber-800"
            }`}
          >
            {status === "error"
              ? "Invalid Stay Pass"
              : "Check-in Not Allowed"}
          </h2>

          <p
            className={`mt-2 font-medium ${
              status === "error"
                ? "text-red-700"
                : "text-amber-700"
            }`}
          >
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
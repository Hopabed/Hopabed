"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { BookingItem, MOCK_BOOKINGS } from "@/data/mockBookings";
import { Property, PROPERTIES } from "@/data/properties";

type BookingContextType = {
  bookings: BookingItem[];
  addBooking: (booking: Omit<BookingItem, "id" | "createdAt" | "status">) => BookingItem;
  cancelBooking: (id: string) => void;
  hostProperties: Property[];
  addHostProperty: (property: Omit<Property, "id">) => Property;
  toggleVerifyProperty: (id: string) => void;
  deleteHostProperty: (id: string) => void;
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<BookingItem[]>(MOCK_BOOKINGS);
  const [hostProperties, setHostProperties] = useState<Property[]>(PROPERTIES);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const storedBookings = localStorage.getItem("hopebed_bookings");
      if (storedBookings) {
        setBookings(JSON.parse(storedBookings));
      } else {
        localStorage.setItem("hopebed_bookings", JSON.stringify(MOCK_BOOKINGS));
      }

      const storedProperties = localStorage.getItem("hopebed_host_properties");
      if (storedProperties) {
        setHostProperties(JSON.parse(storedProperties));
      } else {
        localStorage.setItem("hopebed_host_properties", JSON.stringify(PROPERTIES));
      }
    } catch {
      // Fall back to default memory states
    }
    setInitialized(true);
  }, []);

  function addBooking(newBookingData: Omit<BookingItem, "id" | "createdAt" | "status">): BookingItem {
    const bookingId = `HB-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking: BookingItem = {
      ...newBookingData,
      id: bookingId,
      status: "CONFIRMED",
      createdAt: new Date().toISOString().split("T")[0],
    };

    const updated = [newBooking, ...bookings];
    setBookings(updated);
    try {
      localStorage.setItem("hopebed_bookings", JSON.stringify(updated));
    } catch {}
    return newBooking;
  }

  function cancelBooking(id: string) {
    const updated = bookings.map((b) => (b.id === id ? { ...b, status: "CANCELLED" as const } : b));
    setBookings(updated);
    try {
      localStorage.setItem("hopebed_bookings", JSON.stringify(updated));
    } catch {}
  }

  function addHostProperty(propData: Omit<Property, "id">): Property {
    const id = `prop-${Date.now()}`;
    const newProp: Property = {
      ...propData,
      id,
    };
    const updated = [newProp, ...hostProperties];
    setHostProperties(updated);
    try {
      localStorage.setItem("hopebed_host_properties", JSON.stringify(updated));
    } catch {}
    return newProp;
  }

  function toggleVerifyProperty(id: string) {
    const updated = hostProperties.map((p) => (p.id === id ? { ...p, isVerified: !p.isVerified } : p));
    setHostProperties(updated);
    try {
      localStorage.setItem("hopebed_host_properties", JSON.stringify(updated));
    } catch {}
  }

  function deleteHostProperty(id: string) {
    const updated = hostProperties.filter((p) => p.id !== id);
    setHostProperties(updated);
    try {
      localStorage.setItem("hopebed_host_properties", JSON.stringify(updated));
    } catch {}
  }

  return (
    <BookingContext.Provider
      value={{
        bookings: initialized ? bookings : MOCK_BOOKINGS,
        addBooking,
        cancelBooking,
        hostProperties: initialized ? hostProperties : PROPERTIES,
        addHostProperty,
        toggleVerifyProperty,
        deleteHostProperty,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}

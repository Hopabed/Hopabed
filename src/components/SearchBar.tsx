"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { SearchField } from "./SearchField";
import { CityAutocomplete } from "./CityAutocomplete";

type SearchBarProps = {
  defaultDestination?: string;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: number;
  defaultRooms?: number;
};

export function SearchBar({
  defaultDestination = "",
  defaultCheckIn = "",
  defaultCheckOut = "",
  defaultGuests = 2,
  defaultRooms = 1,
}: SearchBarProps) {
  const router = useRouter();
  const [destination, setDestination] = useState(defaultDestination);
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guests, setGuests] = useState(defaultGuests);
  const [rooms, setRooms] = useState(defaultRooms);
  const [guestOpen, setGuestOpen] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    params.set("guests", String(guests));
    params.set("rooms", String(rooms));
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="relative z-20 mx-auto w-full lg:max-w-[1100px] overflow-visible rounded-[32px] lg:rounded-full bg-white/70 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] border border-white/80 flex flex-col lg:flex-row lg:items-center p-2 transition-all hover:bg-white/80"
    >
      <SearchField label="Where" className="flex-[1.5]">
        <CityAutocomplete
          value={destination}
          onChange={setDestination}
          placeholder="Search Indian cities (e.g. Mumbai, Goa)"
        />
      </SearchField>

      <div className="hidden lg:block w-[1px] h-10 bg-gray-200" />

      <SearchField label="Check in" className="flex-1 border-t border-gray-100 lg:border-t-0">
        <DateInput value={checkIn} onChange={setCheckIn} label="Check-in date" />
      </SearchField>

      <div className="hidden lg:block w-[1px] h-10 bg-gray-200" />

      <SearchField label="Check out" className="flex-1 border-t border-gray-100 lg:border-t-0">
        <DateInput value={checkOut} onChange={setCheckOut} label="Check-out date" />
      </SearchField>

      <div className="hidden lg:block w-[1px] h-10 bg-gray-200" />

      <div className="relative flex min-w-0 flex-[1.4] items-center border-t border-gray-100 lg:border-t-0 hover:bg-white/50 lg:rounded-full transition-all cursor-pointer group">
        <div
          className="flex flex-1 flex-col justify-center px-6 lg:pl-8 lg:pr-4 py-3.5"
          onClick={() => setGuestOpen((open) => !open)}
        >
          <span className="text-[12px] font-extrabold tracking-wide text-gray-900">Who</span>
          <div className="mt-0.5 flex items-center text-sm lg:text-base font-medium text-gray-900">
            <span className="truncate">
              {guests} guest{guests > 1 ? "s" : ""}, {rooms} room{rooms > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {guestOpen ? (
          <div
            className="absolute right-0 top-[80px] z-30 rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-2xl p-6 shadow-2xl lg:w-72 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <Stepper label="Guests" value={guests} min={1} onChange={setGuests} />
            <Stepper label="Rooms" value={rooms} min={1} onChange={setRooms} />
            <button
              type="button"
              onClick={() => setGuestOpen(false)}
              className="mt-4 w-full rounded-xl bg-brand py-2 text-center text-xs font-bold text-white"
            >
              Done
            </button>
          </div>
        ) : null}

        <div className="p-2 shrink-0">
          <button
            type="submit"
            className="flex h-12 w-full lg:h-[56px] lg:w-[56px] lg:p-0 items-center justify-center gap-2 rounded-full bg-brand px-8 text-sm lg:text-base font-bold text-white transition-all hover:bg-brand-dark hover:scale-[1.05] active:scale-[0.95] shadow-lg shadow-brand/30"
          >
            <Search className="h-5 w-5 lg:h-6 lg:w-6" />
            <span className="lg:hidden">Search</span>
          </button>
        </div>
      </div>
    </form>
  );
}

function DateInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <span className="relative block">
      {!value ? (
        <span className="pointer-events-none absolute inset-0 text-sm lg:text-base font-medium text-gray-500">
          Add dates
        </span>
      ) : null}
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full min-w-0 bg-transparent text-sm lg:text-base font-medium outline-none ${
          value ? "text-gray-900" : "text-transparent"
        }`}
        aria-label={label}
        min={new Date().toISOString().split("T")[0]}
      />
    </span>
  );
}

function Stepper({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="mb-3 flex items-center justify-between last:mb-0">
      <span className="text-sm font-semibold text-gray-800">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-40"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-5 text-center text-sm font-bold text-gray-900">{value}</span>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
          onClick={() => onChange(value + 1)}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

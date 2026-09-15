"use client";

import { CalendarDays, ChevronDown, MapPin, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { SearchField } from "./SearchField";

type SearchBarProps = {
  defaultDestination?: string;
};

export function SearchBar({ defaultDestination = "" }: SearchBarProps) {
  const router = useRouter();
  const [destination, setDestination] = useState(defaultDestination);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
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
      className="relative z-20 mx-auto w-full lg:max-w-[1100px] overflow-visible rounded-[32px] lg:rounded-full bg-white/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] border border-white/60 flex flex-col lg:flex-row lg:items-center p-2"
    >
      <SearchField label="Where" className="flex-[1.5]">
        <input
          value={destination}
          onChange={(event) => setDestination(event.target.value)}
          placeholder="Search destinations"
          className="w-full min-w-0 bg-transparent text-sm lg:text-base font-medium text-gray-900 outline-none placeholder:text-gray-600 truncate"
          name="destination"
        />
      </SearchField>
      
      <div className="hidden lg:block w-[1px] h-10 bg-white/60" />
      
      <SearchField label="Check in" className="flex-1 border-t border-white/60 lg:border-t-0">
        <DateInput value={checkIn} onChange={setCheckIn} label="Check-in date" />
      </SearchField>

      <div className="hidden lg:block w-[1px] h-10 bg-white/60" />

      <SearchField label="Check out" className="flex-1 border-t border-white/60 lg:border-t-0">
        <DateInput value={checkOut} onChange={setCheckOut} label="Check-out date" />
      </SearchField>

      <div className="hidden lg:block w-[1px] h-10 bg-white/60" />

      <div 
        className="relative flex min-w-0 flex-[1.4] items-center border-t border-white/60 lg:border-t-0 hover:bg-white/40 lg:rounded-full transition-all cursor-pointer group"
      >
        <div className="flex flex-1 flex-col justify-center px-6 lg:pl-8 lg:pr-4 py-3.5" onClick={() => setGuestOpen((open) => !open)}>
          <span className="text-[12px] font-extrabold tracking-wide text-gray-900">Who</span>
          <div className="mt-0.5 flex items-center text-sm lg:text-base font-medium text-gray-900">
            <span className="truncate">
              {guests} guests, {rooms} room{rooms > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {guestOpen ? (
          <div className="absolute left-4 right-4 top-[80px] z-30 rounded-2xl border border-white/60 bg-white/80 backdrop-blur-2xl p-6 shadow-xl lg:left-0 lg:right-auto lg:w-72 cursor-default" onClick={(e) => e.stopPropagation()}>
            <Stepper label="Guests" value={guests} min={1} onChange={setGuests} />
            <Stepper label="Rooms" value={rooms} min={1} onChange={setRooms} />
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
      {!value ? <span className="pointer-events-none absolute inset-0 text-sm lg:text-base font-medium text-gray-600">Add dates</span> : null}
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full min-w-0 bg-transparent text-sm lg:text-base font-medium outline-none ${value ? "text-gray-900" : "text-transparent"}`}
        aria-label={label}
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
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="h-7 w-7 rounded-full border border-border"
          onClick={() => onChange(Math.max(min, value - 1))}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="w-4 text-center text-sm">{value}</span>
        <button
          type="button"
          className="h-7 w-7 rounded-full border border-border"
          onClick={() => onChange(value + 1)}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

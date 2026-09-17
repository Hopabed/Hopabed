"use client";

import React, { useState, useRef, useEffect } from "react";
import { CITIES, City } from "@/data/cities";
import { MapPin, Sparkles } from "lucide-react";

type CityAutocompleteProps = {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
};

export function CityAutocomplete({
  value,
  onChange,
  placeholder = "Search destination in India...",
}: CityAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredCities = CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(value.toLowerCase()) ||
      c.state.toLowerCase().includes(value.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(city: City) {
    onChange(city.name);
    setIsOpen(false);
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full min-w-0 bg-transparent text-sm lg:text-base font-medium text-gray-900 outline-none placeholder:text-gray-500 truncate"
        name="destination"
        autoComplete="off"
      />

      {isOpen && (
        <div className="absolute left-0 top-[52px] z-50 w-72 lg:w-80 rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl p-3 shadow-2xl transition-all">
          <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-brand" /> Top Indian Cities
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleSelect(city)}
                  className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left hover:bg-brand/10 transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-brand transition-colors">
                        {city.name}
                      </p>
                      <p className="text-xs text-gray-500">{city.state}</p>
                    </div>
                  </div>
                  {city.popular && (
                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-brand">
                      Popular
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-gray-500">
                No matching cities. Press enter to search &quot;{value}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

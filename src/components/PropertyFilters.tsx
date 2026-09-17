"use client";

import React from "react";
import { Filter, RotateCcw, ShieldCheck } from "lucide-react";
import { CITIES } from "@/data/cities";

export type FilterState = {
  minPrice: number;
  maxPrice: number;
  types: string[];
  city: string;
  verifiedOnly: boolean;
};

type PropertyFiltersProps = {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
};

const PROPERTY_TYPES = [
  { id: "hotels", label: "Hotels" },
  { id: "villas", label: "Villas" },
  { id: "apartments", label: "Apartments" },
  { id: "homestays", label: "Homestays" },
  { id: "resorts", label: "Resorts" },
];

export function PropertyFilters({ filters, onChange, onReset }: PropertyFiltersProps) {
  function handleTypeToggle(typeId: string) {
    const exists = filters.types.includes(typeId);
    const updatedTypes = exists
      ? filters.types.filter((t) => t !== typeId)
      : [...filters.types, typeId];
    onChange({ ...filters, types: updatedTypes });
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Filter className="h-4 w-4 text-brand" /> Filters
        </h3>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Verified Only Toggle */}
      <div>
        <label className="flex items-center justify-between cursor-pointer rounded-xl bg-emerald-50 p-3 border border-emerald-100">
          <span className="flex items-center gap-2 text-xs font-bold text-emerald-900">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Hopebed Verified Only
          </span>
          <input
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={(e) => onChange({ ...filters, verifiedOnly: e.target.checked })}
            className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
          />
        </label>
      </div>

      {/* Price Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Price Per Night (₹)
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex-1">
              <span className="text-[11px] text-gray-500 font-medium">Min Price</span>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => onChange({ ...filters, minPrice: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-semibold outline-none focus:border-brand"
                step="500"
                min="0"
              />
            </div>
            <span className="text-gray-400 font-bold mt-4">-</span>
            <div className="flex-1">
              <span className="text-[11px] text-gray-500 font-medium">Max Price</span>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-semibold outline-none focus:border-brand"
                step="500"
                max="20000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Property Type Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Property Type
        </h4>
        <div className="space-y-2">
          {PROPERTY_TYPES.map((type) => {
            const isChecked = filters.types.includes(type.id);
            return (
              <label
                key={type.id}
                className="flex items-center justify-between text-sm font-medium text-gray-700 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-gray-50"
              >
                <span>{type.label}</span>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleTypeToggle(type.id)}
                  className="h-4 w-4 rounded accent-brand cursor-pointer"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* City Filter */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Filter by Destination City
        </h4>
        <select
          value={filters.city}
          onChange={(e) => onChange({ ...filters, city: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-800 outline-none focus:border-brand bg-white"
        >
          <option value="">All Cities in India</option>
          {CITIES.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name} ({c.state})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

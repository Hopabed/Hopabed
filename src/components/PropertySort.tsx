"use client";

import React from "react";
import { ArrowUpDown } from "lucide-react";

export type SortOption = "RECOMMENDED" | "PRICE_ASC" | "PRICE_DESC" | "RATING_DESC";

type PropertySortProps = {
  value: SortOption;
  onChange: (sort: SortOption) => void;
};

export function PropertySort({ value, onChange }: PropertySortProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-gray-500 shrink-0" />
      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider hidden sm:inline">
        Sort By:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-800 shadow-sm outline-none focus:border-brand cursor-pointer"
      >
        <option value="RECOMMENDED">Recommended Stays</option>
        <option value="PRICE_ASC">Price: Low to High</option>
        <option value="PRICE_DESC">Price: High to Low</option>
        <option value="RATING_DESC">Guest Rating: High to Low</option>
      </select>
    </div>
  );
}

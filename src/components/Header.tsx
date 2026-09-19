"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  HelpCircle,
  Briefcase,
  Calendar,
  User,
  LogOut,
  Sparkles,
  Search,
  X,
  ChevronDown,
  Menu,
  Building2,
  Tent,
  PlusCircle,
} from "lucide-react";
import { AuthModal } from "./AuthModal";
import { Logo } from "./Logo";

export default function Header() {
  const { user, openAuthModal, logout, toggleHostMode } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#000000] border-b border-zinc-800/80 shadow-md transition-all duration-200">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 lg:px-10">
        {/* Left: Official Hopebed Wordmark Logo */}
        <Logo />

        {/* Center: High-Contrast Pure White Navigation Links */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-5 xl:gap-7 overflow-x-auto no-scrollbar">
          <Link
            href="/stays"
            style={{ color: '#ffffff' }}
            className="text-xs lg:text-sm font-bold !text-white hover:!text-[#0b8f3c] transition-colors whitespace-nowrap"
          >
            Explore Stays
          </Link>
          <Link
            href="/stays?type=hotels"
            style={{ color: '#ffffff' }}
            className="text-xs lg:text-sm font-bold !text-white hover:!text-[#0b8f3c] transition-colors whitespace-nowrap"
          >
            Hotels
          </Link>
          <Link
            href="/stays?type=villas"
            style={{ color: '#ffffff' }}
            className="text-xs lg:text-sm font-bold !text-white hover:!text-[#0b8f3c] transition-colors whitespace-nowrap"
          >
            Villas
          </Link>
          <Link
            href="/stays?type=apartments"
            style={{ color: '#ffffff' }}
            className="text-xs lg:text-sm font-bold !text-white hover:!text-[#0b8f3c] transition-colors whitespace-nowrap"
          >
            Apartments
          </Link>
          <Link
            href="/stays?type=resorts"
            style={{ color: '#ffffff' }}
            className="text-xs lg:text-sm font-bold !text-white hover:!text-[#0b8f3c] transition-colors whitespace-nowrap"
          >
            Resorts
          </Link>
          <Link
            href="/stays?type=pg"
            style={{ color: '#ffffff' }}
            className="text-xs lg:text-sm font-bold !text-white hover:!text-[#0b8f3c] transition-colors whitespace-nowrap"
          >
            PG & Long-Stay
          </Link>
          <Link
            href="/stays?type=homestays"
            style={{ color: '#ffffff' }}
            className="text-xs lg:text-sm font-bold !text-white hover:!text-[#0b8f3c] transition-colors whitespace-nowrap"
          >
            Homestays
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* List Your Property CTA */}
          <Link
            href="/host"
            style={{ color: '#ffffff' }}
            className="hidden sm:flex items-center gap-1.5 rounded-full bg-[#0b8f3c] hover:bg-[#06752f] px-4.5 py-2 text-xs sm:text-sm font-bold !text-white shadow-xs hover:shadow transition-all whitespace-nowrap"
          >
            <PlusCircle className="h-4 w-4 text-white shrink-0" />
            <span style={{ color: '#ffffff' }}>List Your Property</span>
          </Link>

          <Link
            href="/contact"
            style={{ color: '#ffffff' }}
            className="hidden lg:flex items-center gap-1.5 text-sm font-bold !text-white hover:!text-emerald-400 transition-colors whitespace-nowrap"
          >
            <HelpCircle className="h-4 w-4 text-white shrink-0" />
            <span style={{ color: '#ffffff' }}>Support</span>
          </Link>

          {/* User Account / Profile Button */}
          {user ? (
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-full border border-zinc-700 bg-zinc-900 px-3.5 py-1.5 hover:border-zinc-500 hover:bg-zinc-800 transition-all text-white shadow-2xs"
              >
                <div className="h-7 w-7 rounded-full bg-[#0b8f3c] text-white font-bold flex items-center justify-center text-xs shrink-0 ring-2 ring-emerald-500/30 overflow-hidden">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-full w-full object-cover rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  <span className={user.avatarUrl ? "hidden" : "block"}>
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline text-sm font-bold text-white truncate max-w-[120px]">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="h-4 w-4 text-white shrink-0" />
              </button>

              {/* User Dropdown Panel */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl space-y-1 text-slate-900 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/90 rounded-xl mb-1">
                    <div className="h-9 w-9 rounded-full bg-[#0b8f3c] text-white font-bold flex items-center justify-center text-sm shrink-0 ring-2 ring-emerald-500/20">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="h-full w-full object-cover rounded-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : null}
                      <span className={user.avatarUrl ? "hidden" : "block"}>
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-extrabold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] font-medium text-slate-500 truncate">{user.email}</p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                          user.role?.toLowerCase() === "admin"
                            ? "bg-purple-100 text-purple-800 border border-purple-200"
                            : user.role?.toLowerCase() === "host"
                            ? "bg-teal-100 text-teal-800 border border-teal-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {user.role} Account
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/bookings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-slate-900 hover:bg-slate-100 hover:text-emerald-700 transition-all group"
                  >
                    <Calendar className="h-4.5 w-4.5 text-[#0b8f3c] shrink-0" />
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">My Bookings</span>
                  </Link>

                  {(user.role?.toLowerCase() === "host" || user.role?.toLowerCase() === "admin") && (
                    <Link
                      href="/host/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-slate-900 hover:bg-slate-100 hover:text-teal-700 transition-all group"
                    >
                      <Briefcase className="h-4.5 w-4.5 text-teal-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-900 group-hover:text-teal-700">Host Dashboard</span>
                    </Link>
                  )}

                  {user.role?.toLowerCase() === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-slate-900 hover:bg-slate-100 hover:text-purple-700 transition-all group"
                    >
                      <Sparkles className="h-4.5 w-4.5 text-purple-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-900 group-hover:text-purple-700">Admin Portal</span>
                    </Link>
                  )}


                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-rose-600 hover:bg-rose-50 transition-all group"
                    >
                      <LogOut className="h-4.5 w-4.5 text-rose-500 shrink-0" />
                      <span className="text-xs font-bold text-rose-600">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="flex items-center gap-2 rounded-full bg-white hover:bg-slate-100 px-4.5 py-2 text-xs sm:text-sm font-bold text-slate-900 shadow-xs transition-all whitespace-nowrap cursor-pointer"
            >
              <User className="h-4 w-4 text-slate-900 shrink-0" />
              <span>Sign In<span className="hidden sm:inline"> / Register</span></span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800 transition-all cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Mobile Slide Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200">
          <div className="relative ml-auto h-full w-4/5 max-w-xs bg-slate-950 p-6 shadow-2xl flex flex-col justify-between text-white border-l border-zinc-800 animate-in slide-in-from-right duration-250">
            <div>
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-5">
                <Logo compact />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-full p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="space-y-1.5">
                <Link
                  href="/stays"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  <Search className="h-4 w-4 text-slate-400" />
                  <span>Explore Stays</span>
                </Link>
                <Link
                  href="/stays?type=hotels"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  <Building2 className="h-4 w-4 text-blue-400" />
                  <span>Hotels</span>
                </Link>
                <Link
                  href="/stays?type=villas"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  <Tent className="h-4 w-4 text-amber-400" />
                  <span>Villas</span>
                </Link>
                <Link
                  href="/stays?type=apartments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  <Building2 className="h-4 w-4 text-indigo-400" />
                  <span>Apartments</span>
                </Link>
                <Link
                  href="/stays?type=resorts"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  <Sparkles className="h-4 w-4 text-teal-400" />
                  <span>Resorts</span>
                </Link>
                <Link
                  href="/stays?type=pg"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>PG & Long-Stay</span>
                </Link>
                <Link
                  href="/stays?type=homestays"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  <Tent className="h-4 w-4 text-emerald-400" />
                  <span>Homestays</span>
                </Link>
                <Link
                  href="/host"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 bg-[#0b8f3c] text-white font-bold mt-3"
                >
                  <PlusCircle className="h-5 w-5 text-white" />
                  <span>List Your Property</span>
                </Link>
              </nav>
            </div>

            {!user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full rounded-2xl bg-slate-900 py-3 text-center text-base font-bold text-white shadow-md hover:bg-slate-800 transition-all cursor-pointer"
              >
                Sign In / Register
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-2xl bg-rose-50 py-3 text-center text-base font-bold text-rose-600 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  HelpCircle,
  Briefcase,
  Building2,
  Home,
  Tent,
  Building,
  Menu,
  ChevronDown,
  Calendar,
  User,
  ShieldCheck,
  LogOut,
  Sparkles,
  Search,
  X,
} from "lucide-react";
import { AuthModal } from "./AuthModal";

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
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-xl shadow-sm transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex shrink-0 items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/logo.png"
              alt="HopeBed Logo"
              width={130}
              height={34}
              className="object-contain transition-transform group-hover:scale-[1.02]"
              priority
            />
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-brand border border-blue-100">
            <ShieldCheck className="h-3 w-3 text-brand" /> Verified
          </span>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2">
          <Link
            href="/stays"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 hover:bg-brand/10 hover:text-brand transition-colors"
          >
            <Search className="h-4 w-4 text-brand" /> Explore Stays
          </Link>
          <Link
            href="/stays?type=hotels"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 hover:text-brand transition-colors"
          >
            <Building2 className="h-4 w-4 text-gray-500" /> Hotels
          </Link>
          <Link
            href="/stays?type=villas"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 hover:text-brand transition-colors"
          >
            <Home className="h-4 w-4 text-gray-500" /> Villas
          </Link>
          <Link
            href="/stays?type=homestays"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 hover:text-brand transition-colors"
          >
            <Tent className="h-4 w-4 text-gray-500" /> Homestays
          </Link>
          <Link
            href="/stays?type=apartments"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 hover:text-brand transition-colors"
          >
            <Building className="h-4 w-4 text-gray-500" /> Apartments
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/host"
            className="hidden md:flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-800 hover:bg-gray-50 hover:border-brand transition-all"
          >
            <Briefcase className="h-3.5 w-3.5 text-brand" /> Become a Host
          </Link>

          <Link
            href="/contact"
            className="hidden xl:flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-gray-600 hover:text-brand transition-colors"
          >
            <HelpCircle className="h-3.5 w-3.5" /> Support
          </Link>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white p-1.5 pr-3 shadow-sm hover:border-brand transition-all"
              >
                <div className="relative h-7 w-7 overflow-hidden rounded-full bg-brand/10 text-brand font-bold flex items-center justify-center text-xs">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden sm:inline text-xs font-bold text-gray-800 truncate max-w-[100px]">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>

              {/* User Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-gray-100 bg-white/95 backdrop-blur-xl p-2 shadow-2xl space-y-1">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <p className="text-xs font-extrabold text-gray-900">{user.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-brand">
                      {user.role} Account
                    </span>
                  </div>

                  <Link
                    href="/bookings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 hover:bg-brand/10 hover:text-brand transition-colors"
                  >
                    <Calendar className="h-4 w-4 text-brand" /> My Bookings
                  </Link>

                  <Link
                    href="/host/dashboard"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 hover:bg-brand/10 hover:text-brand transition-colors"
                  >
                    <Briefcase className="h-4 w-4 text-brand" /> Host Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      toggleHostMode();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <Sparkles className="h-4 w-4 text-amber-500" /> Switch to {user.role === "HOST" ? "Guest" : "Host"} Mode
                  </button>

                  <div className="border-t border-gray-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand/20 hover:bg-brand-dark transition-all"
            >
              <User className="h-3.5 w-3.5" /> Sign In / Register
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm lg:hidden">
          <div className="relative ml-auto h-full w-4/5 max-w-xs bg-white p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <Image src="/logo.png" alt="HopeBed Logo" width={110} height={28} />
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <nav className="space-y-2">
                <Link
                  href="/stays"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-brand/10 hover:text-brand"
                >
                  <Search className="h-4 w-4 text-brand" /> Explore All Stays
                </Link>
                <Link
                  href="/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-brand/10 hover:text-brand"
                >
                  <Calendar className="h-4 w-4 text-brand" /> My Bookings
                </Link>
                <Link
                  href="/host"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-brand/10 hover:text-brand"
                >
                  <Briefcase className="h-4 w-4 text-brand" /> Become a Host
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-brand/10 hover:text-brand"
                >
                  <HelpCircle className="h-4 w-4 text-gray-500" /> Contact Support
                </Link>
                <Link
                  href="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 hover:bg-brand/10 hover:text-brand"
                >
                  <Sparkles className="h-4 w-4 text-amber-500" /> FAQs
                </Link>
              </nav>
            </div>

            {!user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full rounded-2xl bg-brand py-3 text-center text-sm font-bold text-white shadow-lg"
              >
                Sign In / Register
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-2xl bg-rose-50 py-3 text-center text-sm font-bold text-rose-700"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}

      <AuthModal />
    </header>
  );
}
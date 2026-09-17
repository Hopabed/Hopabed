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
    <header className="sticky top-0 z-50 border-b border-white/15 bg-black/95 backdrop-blur-2xl shadow-xl transition-all duration-300">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5">
        {/* Left: Brand Logo */}
        <div className="flex shrink-0 items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <Image
              src="/logo.png"
              alt="Hopebed Logo"
              width={135}
              height={34}
              className="object-contain transition-transform group-hover:scale-[1.02]"
              priority
            />
          </Link>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/40 whitespace-nowrap">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Verified
          </span>
        </div>

        {/* Center: Single-Line High Contrast Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0">
          <Link
            href="/stays"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs xl:text-sm font-bold text-white hover:bg-white/15 transition-all whitespace-nowrap shrink-0"
          >
            <Search className="h-4 w-4 text-white shrink-0" />
            <span className="text-white whitespace-nowrap">Explore Stays</span>
          </Link>
          <Link
            href="/stays?type=hotels"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs xl:text-sm font-bold text-white hover:bg-white/15 transition-all whitespace-nowrap shrink-0"
          >
            <Building2 className="h-4 w-4 text-white shrink-0" />
            <span className="text-white whitespace-nowrap">Hotels</span>
          </Link>
          <Link
            href="/stays?type=villas"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs xl:text-sm font-bold text-white hover:bg-white/15 transition-all whitespace-nowrap shrink-0"
          >
            <Home className="h-4 w-4 text-white shrink-0" />
            <span className="text-white whitespace-nowrap">Villas</span>
          </Link>
          <Link
            href="/stays?type=homestays"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs xl:text-sm font-bold text-white hover:bg-white/15 transition-all whitespace-nowrap shrink-0"
          >
            <Tent className="h-4 w-4 text-white shrink-0" />
            <span className="text-white whitespace-nowrap">Homestays</span>
          </Link>
          <Link
            href="/stays?type=apartments"
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs xl:text-sm font-bold text-white hover:bg-white/15 transition-all whitespace-nowrap shrink-0"
          >
            <Building className="h-4 w-4 text-white shrink-0" />
            <span className="text-white whitespace-nowrap">Apartments</span>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Link
            href="/host"
            className="hidden md:flex items-center gap-1.5 rounded-full border border-blue-500/80 bg-blue-600 px-4 py-2 text-xs xl:text-sm font-bold text-white shadow-md shadow-blue-600/40 hover:bg-blue-500 transition-all whitespace-nowrap shrink-0"
          >
            <Briefcase className="h-4 w-4 text-white shrink-0" />
            <span className="text-white whitespace-nowrap">Become a Host</span>
          </Link>

          <Link
            href="/contact"
            className="hidden xl:flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs xl:text-sm font-bold text-white hover:bg-white/15 transition-all whitespace-nowrap shrink-0"
          >
            <HelpCircle className="h-4 w-4 text-white shrink-0" />
            <span className="text-white whitespace-nowrap">Support</span>
          </Link>

          {user ? (
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 p-1.5 pr-3 shadow-md hover:border-white hover:bg-white/20 transition-all text-white whitespace-nowrap"
              >
                <div className="relative h-7 w-7 overflow-hidden rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0 border border-white/30">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : null}
                  <span className={user.avatarUrl ? "hidden" : "block"}>{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <span className="hidden sm:inline text-xs font-bold text-white truncate max-w-[100px] whitespace-nowrap">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-white shrink-0" />
              </button>

              {/* User Dropdown */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-white/20 bg-black p-2.5 shadow-2xl space-y-1 text-white">
                  <div className="px-3.5 py-3 border-b border-white/15 flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shrink-0 border border-white/30">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : null}
                      <span className={user.avatarUrl ? "hidden" : "block"}>{user.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-extrabold text-white truncate">{user.name}</p>
                      <p className="text-xs text-white/70 truncate">{user.email}</p>
                      <span className="mt-1 inline-block rounded-full bg-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-white border border-blue-400/50">
                        {user.role} Account
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/bookings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white hover:bg-white/15 transition-colors"
                  >
                    <Calendar className="h-4 w-4 text-white" />
                    <span className="text-white">My Bookings</span>
                  </Link>

                  <Link
                    href="/host/dashboard"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white hover:bg-white/15 transition-colors"
                  >
                    <Briefcase className="h-4 w-4 text-white" />
                    <span className="text-white">Host Dashboard</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      toggleHostMode();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold text-white hover:bg-white/15 transition-colors"
                  >
                    <Sparkles className="h-4 w-4 text-amber-300" />
                    <span className="text-white">Switch to {user.role === "HOST" ? "Guest" : "Host"} Mode</span>
                  </button>

                  <div className="border-t border-white/15 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold text-rose-400 hover:bg-rose-500/20 transition-colors"
                    >
                      <LogOut className="h-4 w-4 text-rose-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/40 hover:bg-blue-500 transition-all whitespace-nowrap shrink-0"
            >
              <User className="h-4 w-4 text-white shrink-0" />
              <span className="text-white whitespace-nowrap">Sign In / Register</span>
            </button>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-white shrink-0"
          >
            <Menu className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-md lg:hidden">
          <div className="relative ml-auto h-full w-4/5 max-w-xs bg-black p-6 shadow-2xl flex flex-col justify-between text-white border-l border-white/20">
            <div>
              <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-4">
                <Image src="/logo.png" alt="Hopebed Logo" width={120} height={30} />
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              <nav className="space-y-2">
                <Link
                  href="/stays"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white hover:bg-white/15"
                >
                  <Search className="h-4 w-4 text-white" />
                  <span className="text-white">Explore All Stays</span>
                </Link>
                <Link
                  href="/bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white hover:bg-white/15"
                >
                  <Calendar className="h-4 w-4 text-white" />
                  <span className="text-white">My Bookings</span>
                </Link>
                <Link
                  href="/host"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white hover:bg-white/15"
                >
                  <Briefcase className="h-4 w-4 text-white" />
                  <span className="text-white">Become a Host</span>
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white hover:bg-white/15"
                >
                  <HelpCircle className="h-4 w-4 text-white" />
                  <span className="text-white">Contact Support</span>
                </Link>
                <Link
                  href="/faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-bold text-white hover:bg-white/15"
                >
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  <span className="text-white">FAQs</span>
                </Link>
              </nav>
            </div>

            {!user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full rounded-2xl bg-blue-600 py-3.5 text-center text-sm font-bold text-white shadow-lg"
              >
                Sign In / Register
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full rounded-2xl bg-rose-600/30 py-3.5 text-center text-sm font-bold text-rose-300 border border-rose-500/40"
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
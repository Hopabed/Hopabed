"use client";

import { Facebook, Instagram, Linkedin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./Logo";

const COMPANY = [
  { href: "/stays", label: "Explore Stays" },
  { href: "/about", label: "About Hopebed" },
  { href: "/contact", label: "Contact Us" },
  { href: "/faq", label: "Help Center & FAQs" },
];

const SUPPORT = [
  { href: "/bookings", label: "My Bookings" },
  { href: "/contact", label: "Grievance Support" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

const HOSTS = [
  { href: "/host", label: "Become a Host" },
  { href: "/host/dashboard", label: "Host Dashboard" },
  { href: "/host", label: "Verification Guide" },
  { href: "/host", label: "Host Payouts" },
];

export function Footer() {
  return (
    <footer className="bg-black text-white border-t border-neutral-800">
      <div className="container-page py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand Column */}
          <div className="flex flex-col">
            <Logo inverted={true} />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-neutral-400">
              Hopebed is building India&apos;s smartest verified hotel and stay booking platform. Discover hotels, villas, homestays, and apartments with guaranteed instant bookings.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-400">
              <ShieldCheck className="h-4 w-4" /> 100% On-Site Property Verification
            </div>
            <div className="mt-6 flex gap-4">
              <Social href="#" label="Instagram">
                <Instagram className="h-[18px] w-[18px]" />
              </Social>
              <Social href="#" label="Facebook">
                <Facebook className="h-[18px] w-[18px]" />
              </Social>
              <Social href="#" label="X">
                <span className="text-[14px] font-bold tracking-tighter">𝕏</span>
              </Social>
              <Social href="#" label="LinkedIn">
                <Linkedin className="h-[18px] w-[18px]" />
              </Social>
            </div>
          </div>

          {/* Links Columns */}
          <FooterColumn title="Company" links={COMPANY} />
          <FooterColumn title="Support" links={SUPPORT} />
          <FooterColumn title="For Hosts" links={HOSTS} />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-800 bg-black">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-xs text-neutral-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Hopebed.in | All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Built for</span>
            <span className="text-blue-500 font-bold">Hopebed India</span>
            <span>• Stay Smart. Stay Verified.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="mb-6 text-xs font-bold uppercase tracking-wider text-neutral-300">{title}</h3>
      <ul className="space-y-4 text-sm text-neutral-400">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: ReactNode }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-neutral-300 ring-1 ring-neutral-800 transition-all hover:scale-110 hover:bg-blue-600 hover:text-white hover:ring-blue-600"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

"use client";

import { Facebook, Instagram, Linkedin, ArrowRight, Mail } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "./Logo";

const COMPANY = [
  { href: "/about", label: "About Us" },
  { href: "/careers", label: "Careers" },
  { href: "/blog", label: "Blog" },
  { href: "/press", label: "Press" },
  { href: "/contact", label: "Contact Us" },
];

const SUPPORT = [
  { href: "/help", label: "Help Center" },
  { href: "/cancellation", label: "Cancellation Policy" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/sitemap", label: "Sitemap" },
];

const HOSTS = [
  { href: "/host", label: "List Your Property" },
  { href: "/host", label: "Host Login" },
  { href: "/host/resources", label: "Resources" },
  { href: "/host/pricing", label: "Pricing" },
  { href: "/host", label: "Host Support" },
];

export function Footer() {
  return (
    <footer className="bg-[#050505] text-white">
      <div className="container-page py-16 lg:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.5fr]">
          {/* Brand Column */}
          <div className="flex flex-col">
            <Logo />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/60">
              Hopebed is building a smarter way to find, book and verify stays in India. Discover your perfect getaway with us.
            </p>
            <div className="mt-8 flex gap-4">
              <Social href="https://instagram.com" label="Instagram">
                <Instagram className="h-[18px] w-[18px]" />
              </Social>
              <Social href="https://facebook.com" label="Facebook">
                <Facebook className="h-[18px] w-[18px]" />
              </Social>
              <Social href="https://x.com" label="X">
                <span className="text-[14px] font-bold tracking-tighter">𝕏</span>
              </Social>
              <Social href="https://linkedin.com" label="LinkedIn">
                <Linkedin className="h-[18px] w-[18px]" />
              </Social>
            </div>
          </div>

          {/* Links Columns */}
          <FooterColumn title="Company" links={COMPANY} />
          <FooterColumn title="Support" links={SUPPORT} />
          <FooterColumn title="For Hosts" links={HOSTS} />

          {/* Newsletter Column */}
          <div className="flex flex-col">
            <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-white/90">Stay Updated</h3>
            <p className="mb-4 text-sm text-white/60">
              Subscribe to our newsletter for the latest travel updates and exclusive offers.
            </p>
            <form className="relative mt-2 flex items-center" onSubmit={(e) => e.preventDefault()}>
              <Mail className="absolute left-3.5 h-4 w-4 text-white/40" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-xl bg-white/5 py-3.5 pl-10 pr-12 text-sm text-white placeholder:text-white/40 outline-none ring-1 ring-white/10 transition-all focus:bg-white/10 focus:ring-brand"
                required
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white transition-transform hover:scale-105 active:scale-95"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-[#000000]">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-6 text-xs text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} Hopebed.in | All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Made with</span>
            <span className="text-brand text-sm">♥</span>
            <span>in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-white/90">{title}</h3>
      <ul className="space-y-4 text-sm text-white/60">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="transition-colors hover:text-brand">
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
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-white/80 ring-1 ring-white/10 transition-all hover:scale-110 hover:bg-brand hover:text-white hover:ring-brand"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

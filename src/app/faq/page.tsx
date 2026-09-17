"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

type FAQItem = {
  question: string;
  answer: string;
  category: string;
};

const FAQS: FAQItem[] = [
  {
    category: "Booking & Payments",
    question: "How does booking a stay work on Hopebed?",
    answer: "Browse our 20+ verified properties or search by city, select your check-in/check-out dates and guest count, click Reserve, and complete checkout. You will receive an instant confirmed booking receipt with a unique Booking ID.",
  },
  {
    category: "Booking & Payments",
    question: "What payment methods are supported?",
    answer: "Hopebed accepts all major Indian payment channels including UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and instant payment links.",
  },
  {
    category: "Verification",
    question: "What does 'Hopebed Verified Stay' mean?",
    answer: "Every verified stay undergoes physical on-site inspections by Hopebed auditors to ensure photographs, safety amenities, clean linen, working WiFi, and host credentials match 100% with the listing.",
  },
  {
    category: "Cancellation & Refunds",
    question: "What is Hopebed's cancellation policy?",
    answer: "All standard bookings on Hopebed feature 100% free cancellation up to 48 hours prior to your scheduled check-in date. Refunds are processed back to your original payment method within 2-4 business days.",
  },
  {
    category: "Hosting",
    question: "How do I become a host on Hopebed?",
    answer: "Click 'Become a Host' in the navigation bar, sign up for a host account, and access your Host Dashboard to list your hotel, villa, homestay, or apartment. You can start receiving bookings immediately.",
  },
  {
    category: "Hosting",
    question: "How do host payouts work?",
    answer: "Payouts are automatically remitted to the host's registered bank account or UPI ID on the day of guest check-in.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="bg-gray-50 min-h-screen py-16">
      <div className="container-page max-w-3xl">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-brand uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5" /> Help Center
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Frequently Asked Questions</h1>
          <p className="mt-2 text-sm text-gray-600">
            Find answers to common questions about bookings, stay verification, cancellation policies, and hosting.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-gray-900 hover:text-brand transition-colors"
                >
                  <span className="flex items-center gap-3 text-base">
                    <HelpCircle className="h-5 w-5 text-brand shrink-0" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-brand" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                    <p>{faq.answer}</p>
                    <span className="mt-3 inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-brand">
                      {faq.category}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, Sparkles, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="bg-gray-50 min-h-screen py-16">
      <div className="container-page max-w-4xl">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-brand uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5" /> 24/7 Hopebed Support
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Get in Touch with Us</h1>
          <p className="mt-2 text-sm text-gray-600">
            Have questions about a booking, property verification, or host registration? Our team is here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400">Email Us</p>
                  <p className="text-sm font-bold text-gray-900">support@hopebed.in</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400">Call Support</p>
                  <p className="text-sm font-bold text-gray-900">+91 1800-HOPEBED</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-gray-400">Headquarters</p>
                  <p className="text-xs font-semibold text-gray-800">Bandra West, Mumbai, Maharashtra 400050</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 space-y-2">
              <h3 className="font-bold text-brand text-sm flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" /> Instant Response Time
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Our support desk operates round the clock. Expect a response within 2 hours for all booking inquiries.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Message Sent Successfully!</h3>
                  <p className="text-sm text-gray-600 max-w-md mx-auto">
                    Thank you for reaching out, {name}. A support specialist will review your request and contact you at{" "}
                    <span className="font-bold text-gray-900">{email}</span> shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 rounded-xl bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-md"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Send us a Message</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Your Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Sharukh Mithagari"
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium outline-none focus:border-brand"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Your Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="your@email.com"
                        className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium outline-none focus:border-brand"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      placeholder="e.g. Booking inquiry / Verification question"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Message</label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      placeholder="Describe how we can help you..."
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium outline-none focus:border-brand"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-brand py-3.5 text-center text-sm font-extrabold text-white shadow-lg shadow-brand/25 hover:bg-brand-dark transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" /> Send Message Now
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

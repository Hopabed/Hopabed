"use client";

import { useState } from "react";

export default function GrievancePage() {
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call for now; the actual API will be built shortly
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      const response = await fetch('/api/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: formData.get('subject'),
          description: formData.get('description'),
          contactEmail: formData.get('email')
        })
      });
      const data = await response.json();
      if(data.ticketId) {
        setTicketId(data.ticketId);
      }
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="container-page max-w-4xl py-16">
      <h1 className="mb-4 text-4xl font-bold text-ink-soft">Grievance Portal</h1>
      <p className="mb-4 text-sm font-semibold text-brand">Designed to support compliance with applicable Indian data protection, consumer protection and information technology requirements.</p>
      <p className="mb-8 text-sm text-muted">
        In accordance with the Consumer Protection (E-Commerce) Rules, grievances will be acknowledged within 48 hours and redressed within one month.
      </p>

      {ticketId ? (
        <div className="bg-emerald-50 text-emerald-800 p-6 rounded-xl border border-emerald-100">
          <h2 className="text-lg font-bold mb-2">Ticket Submitted Successfully</h2>
          <p>Your grievance reference ticket number is: <strong>{ticketId}</strong></p>
          <p className="text-sm mt-2">Please keep this number for your records. You can use it to track your complaint status.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" name="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input type="text" name="subject" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grievance Description</label>
            <textarea name="description" required rows={5} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand"></textarea>
          </div>
          <button type="submit" className="bg-brand text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-dark transition-colors">Submit Grievance</button>
        </form>
      )}

      <div className="mt-12 pt-8 border-t border-gray-100">
        <h2 className="text-xl font-bold text-ink-soft mb-4">Grievance Officer Details</h2>
        <ul className="list-none text-sm text-muted space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <li><strong>Name:</strong> Sharukh Mithagari</li>
          <li><strong>Designation:</strong> Nodal Grievance & Compliance Officer</li>
          <li><strong>Address:</strong> Hopebed Technologies, Sector 17, Vashi, Navi Mumbai, Maharashtra 400703, India</li>
          <li><strong>Email:</strong> grievance@hopebed.in</li>
          <li><strong>Phone:</strong> +91 9930467576</li>
        </ul>
      </div>
    </div>
  );
}

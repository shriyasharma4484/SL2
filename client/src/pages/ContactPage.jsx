import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Reach Our Pune Team
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact Sevadeep NGO
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm">
          Have an urgent community concern, want to sponsor cleanup equipment, or partner for a neighborhood drive?
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info (5 cols) */}
        <div className="lg:col-span-5 bg-forest-dark text-white rounded-3xl p-8 space-y-6 shadow-xl">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Sevadeep Community Office</h3>
            <p className="text-xs text-emerald-200 leading-relaxed">
              We operate an open helpdesk for resident associations, student volunteers, and neighborhood committees.
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-200">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Physical Address:</p>
                <p>Deccan Gymkhana / Shivajinagar Area, Pune, Maharashtra 411004, India</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">General Email:</p>
                <p>contact@sevadeep.org</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Helpline Phone:</p>
                <p>+91 98230 11223 (Mon - Sat, 9:00 AM - 6:00 PM)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Volunteer Briefing Hours:</p>
                <p>Every Saturday 08:00 AM - 10:00 AM at Deccan Mutha Riverbed Walkway</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Message Received</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Thank you for reaching out to Sevadeep NGO. Our coordination team in Pune will review your inquiry within 24 hours.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-emerald-700 underline"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Send an Inquiry or Message</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-hidden"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-hidden"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-hidden"
                  placeholder="e.g. Neighborhood Cleanliness Collaboration in Kothrud"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Message</label>
                <textarea
                  rows="4"
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 outline-hidden"
                  placeholder="Your message to Sevadeep coordinators..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="py-3 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

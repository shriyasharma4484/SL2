import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Heart, Shield, ExternalLink, Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-forest-dark text-slate-300 border-t border-forest-light/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: About NGO */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-950 p-1 flex items-center justify-center border border-emerald-700/60">
                <img
                  src="/assets/sevadeep_logo.png"
                  alt="Sevadeep NGO Logo"
                  className="h-full w-full object-contain filter brightness-125"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">Sevadeep</span>
                <span className="ml-1.5 text-xs text-emerald-400 font-semibold tracking-wider uppercase">CivicConnect</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Empowering Pune residents to identify civic problems, collaborate with grassroots volunteers, and build cleaner, safer, and more sustainable neighborhoods together.
            </p>

            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-[11px] text-emerald-200">
              <p className="font-semibold text-emerald-300 flex items-center gap-1.5 mb-1">
                <Leaf className="w-3.5 h-3.5" />
                <span>Our Core Motto</span>
              </p>
              <p className="italic text-slate-300">
                "Your Community. Your Voice. Together, We Create Change."
              </p>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">Home Page</Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-emerald-400 transition-colors">Report a Local Issue</Link>
              </li>
              <li>
                <Link to="/issues" className="hover:text-emerald-400 transition-colors">Search Community Issues</Link>
              </li>
              <li>
                <Link to="/activities" className="hover:text-emerald-400 transition-colors">Volunteer Cleanliness Drives</Link>
              </li>
              <li>
                <Link to="/impact" className="hover:text-emerald-400 transition-colors">Social Impact & Transparency</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-emerald-400 transition-colors">About Sevadeep NGO</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Civic Categories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Issue Categories</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/issues?category=Garbage+and+Waste+Management" className="hover:text-emerald-400 transition-colors">
                  Garbage & Waste Management
                </Link>
              </li>
              <li>
                <Link to="/issues?category=Public+Cleanliness" className="hover:text-emerald-400 transition-colors">
                  Public Cleanliness & Sanity
                </Link>
              </li>
              <li>
                <Link to="/issues?category=Water+Leakage" className="hover:text-emerald-400 transition-colors">
                  Water Pipeline Leakages
                </Link>
              </li>
              <li>
                <Link to="/issues?category=Damaged+Public+Facilities" className="hover:text-emerald-400 transition-colors">
                  Damaged Public Facilities
                </Link>
              </li>
              <li>
                <Link to="/issues?category=Environmental+Problems" className="hover:text-emerald-400 transition-colors">
                  Environmental & Riverbed Health
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Verified Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Sevadeep NGO Office</h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Deccan Gymkhana / Shivajinagar Area, Pune, Maharashtra 411004, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a href="mailto:contact@sevadeep.org" className="hover:text-emerald-400">contact@sevadeep.org</a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>+91 98230 11223 (Community Helpdesk)</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-900/50 border border-emerald-700/50 text-emerald-300 px-2.5 py-1 rounded">
                <Shield className="w-3 h-3" />
                <span>Registered Non-Profit • Pune Chapter</span>
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Demonstration Notice */}
        <div className="border-t border-emerald-900/50 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} Sevadeep NGO, Pune. All rights reserved. Platform inspired by CivicSeva.
          </p>

          <div className="p-2 rounded bg-emerald-950/40 text-[11px] text-amber-300/90 border border-amber-900/40 text-center">
            ⚠️ <strong>Demonstration Notice:</strong> Sample statistics and demonstration records are clearly marked. Sevadeep does not invent actual civic achievements.
          </div>

          <div className="flex items-center gap-4 text-xs">
            <Link to="/about" className="hover:text-white">Privacy Policy</Link>
            <Link to="/about" className="hover:text-white">Terms of Community Service</Link>
            <Link to="/contact" className="hover:text-white">Grievance Escalation</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

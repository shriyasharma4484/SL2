import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Shield, Users, Target, Heart, CheckCircle2, Award, Building } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Grassroots Civic Leadership
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About Sevadeep NGO, Pune
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Founded on the conviction that clean, green, and dignified neighborhoods start with community ownership.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Our Community Mission</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            To provide an accessible, transparent civic engagement platform where every Pune resident can report neighborhood hazards, collaborate with youth volunteers, and hold public authorities accountable through verified data.
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Zero-bureaucracy reporting with OpenStreetMap coordinates</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Grassroots volunteer mobilization for cleanliness and afforestation</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Direct escalation bridge with Pune Municipal Corporation (PMC)</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center">
            <Leaf className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Our Core Values</h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Sevadeep is guided by complete truthfulness in reporting. We never fabricate accomplishments or claim unearned credit. Every verified outcome requires coordinator sign-off and reporter confirmation.
          </p>
          <ul className="space-y-2 text-xs text-slate-700">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Citizen Empowerment: "Your Community. Your Voice. Together We Create Change."</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Environmental Stewardship of Pune's rivers, hills (Tekdis), and public gardens</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Responsible Data Governance: Personal citizen privacy strictly protected</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Leadership & Advisory */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Governance & Coordinators
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight mt-1">
            Sevadeep Pune Core Coordination Team
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Dedicated social workers, environmental engineers, and community liaisons based in Shivajinagar & Deccan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <div className="h-12 w-12 rounded-full bg-emerald-700 text-white font-bold text-base flex items-center justify-center mb-3">
              AJ
            </div>
            <h4 className="font-bold text-sm text-white">Dr. Ananya Joshi</h4>
            <p className="text-emerald-400 text-xs">Chief Coordinator</p>
            <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
              Ph.D. in Environmental Sciences. Spearheads Mutha riverbed restoration and waste segregation programs across Pune.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <div className="h-12 w-12 rounded-full bg-emerald-700 text-white font-bold text-base flex items-center justify-center mb-3">
              VD
            </div>
            <h4 className="font-bold text-sm text-white">Vikram Deshmukh</h4>
            <p className="text-emerald-400 text-xs">Municipal Affairs Liaison</p>
            <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
              Former urban planner with 12+ years experience in Pune municipal governance, solid waste protocols, and PMC liaison.
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <div className="h-12 w-12 rounded-full bg-emerald-700 text-white font-bold text-base flex items-center justify-center mb-3">
              AK
            </div>
            <h4 className="font-bold text-sm text-white">Aarav Kulkarni</h4>
            <p className="text-emerald-400 text-xs">Head Volunteer Captain</p>
            <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
              Leads volunteer mobilization across colleges including Fergusson, COEP, and SPPU for weekend cleanliness drives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

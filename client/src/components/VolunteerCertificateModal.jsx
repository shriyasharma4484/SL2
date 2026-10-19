import React from 'react';
import { Award, Printer, X, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';

export default function VolunteerCertificateModal({ user, isOpen, onClose }) {
  if (!isOpen || !user) return null;

  const certNumber = `SVD-CERT-2026-${String(user.id || 1).padStart(4, '0')}${Math.floor(Math.random() * 89 + 10)}`;
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Volunteer Certificate - ${user.name}</title>
          <style>
            @page { size: landscape; margin: 15mm; }
            body {
              font-family: 'Georgia', serif;
              margin: 0;
              padding: 20px;
              color: #1e293b;
              background: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .cert-box {
              border: 8px double #064e3b;
              padding: 40px;
              text-align: center;
              width: 100%;
              max-width: 900px;
              position: relative;
              background: #fcfdfa;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-25deg);
              font-size: 80px;
              font-weight: bold;
              color: rgba(6, 78, 59, 0.04);
              letter-spacing: 12px;
              pointer-events: none;
              text-transform: uppercase;
            }
            .ngo-name {
              font-size: 26px;
              font-weight: 900;
              color: #064e3b;
              letter-spacing: 2px;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .ngo-sub {
              font-size: 11px;
              color: #475569;
              letter-spacing: 1px;
              margin-bottom: 20px;
            }
            .cert-title {
              font-size: 32px;
              color: #047857;
              font-style: italic;
              margin: 15px 0;
            }
            .presented {
              font-size: 14px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .recipient {
              font-size: 36px;
              font-weight: bold;
              color: #0f172a;
              border-bottom: 2px solid #cbd5e1;
              display: inline-block;
              padding: 5px 30px;
              margin: 10px 0 20px;
            }
            .reason {
              font-size: 15px;
              line-height: 1.8;
              max-width: 700px;
              margin: 0 auto 30px;
              color: #334155;
            }
            .metrics {
              display: flex;
              justify-content: center;
              gap: 40px;
              margin-bottom: 30px;
            }
            .metric-item {
              border: 1px solid #cbd5e1;
              padding: 10px 20px;
              border-radius: 8px;
              background: #fff;
            }
            .metric-val {
              font-size: 20px;
              font-weight: bold;
              color: #047857;
            }
            .metric-lbl {
              font-size: 10px;
              text-transform: uppercase;
              color: #64748b;
            }
            .footer-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: 40px;
              padding: 0 40px;
            }
            .sign-line {
              width: 180px;
              border-top: 1px solid #0f172a;
              padding-top: 6px;
              font-size: 12px;
              font-weight: bold;
              color: #0f172a;
            }
            .cert-id {
              font-size: 10px;
              font-family: monospace;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <div class="watermark">SEVADEEP NGO</div>
            <div class="ngo-name">Sevadeep Foundation &amp; CivicConnect</div>
            <div class="ngo-sub">Registered Non-Governmental Organization • Pune, Maharashtra, India</div>
            <div class="cert-title">Certificate of Verified Civic Service</div>
            <div class="presented">This certificate is proudly awarded to</div>
            <div class="recipient">${user.name}</div>
            <div class="reason">
              For exemplary dedication to community sanitation, civic improvement, and active volunteer service in Pune. Their verified contribution directly advances the United Nations Sustainable Development Goals (SDG 11: Sustainable Cities &amp; Communities).
            </div>
            <div class="metrics">
              <div class="metric-item">
                <div class="metric-val">${user.service_hours || 12} Hours</div>
                <div class="metric-lbl">Verified Service</div>
              </div>
              <div class="metric-item">
                <div class="metric-val">${user.points || 75} Points</div>
                <div class="metric-lbl">Civic Impact Score</div>
              </div>
              <div class="metric-item">
                <div class="metric-val">Pune, MH</div>
                <div class="metric-lbl">Operational Area</div>
              </div>
            </div>
            <div class="footer-row">
              <div>
                <div class="sign-line">Dr. Ananya Joshi</div>
                <div style="font-size: 10px; color: #64748b;">Chief Field Coordinator, Sevadeep</div>
              </div>
              <div class="cert-id">
                Certificate ID: <strong>${certNumber}</strong><br/>
                Issued: ${issueDate}
              </div>
              <div>
                <div class="sign-line">Vikram Deshmukh</div>
                <div style="font-size: 10px; color: #64748b;">President &amp; Trustee, Sevadeep NGO</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-6">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Official Volunteer Service Credential
              </h3>
              <p className="text-[11px] text-slate-500">
                Valid for Academic CSR Credits, University Portfolios &amp; Job Applications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Certificate Preview Card */}
        <div className="border-4 border-double border-emerald-900/20 bg-emerald-50/20 p-6 rounded-2xl text-center space-y-4 relative overflow-hidden">
          <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-800">
            Sevadeep NGO • CivicConnect Pune
          </div>
          <h2 className="text-xl sm:text-2xl font-serif italic text-emerald-950 font-bold">
            Certificate of Verified Civic Service
          </h2>
          <p className="text-xs text-slate-500 uppercase tracking-wider">Presented To</p>
          <div className="text-2xl font-extrabold text-slate-900 border-b border-slate-300 pb-1 inline-block px-6">
            {user.name}
          </div>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            In recognition of verified on-ground contributions toward community clean-up drives, solid waste management, and civic advocacy in Pune.
          </p>

          <div className="flex justify-center gap-6 pt-2">
            <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-base font-bold text-emerald-800">{user.service_hours || 12} hrs</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Verified Service</div>
            </div>
            <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-base font-bold text-emerald-800">{user.points || 75} pts</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Civic Karma</div>
            </div>
            <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <div className="text-base font-bold text-emerald-800">Pune, MH</div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Location</div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between text-[10px] text-slate-400 border-t border-emerald-900/10">
            <span className="font-mono">{certNumber}</span>
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified by Sevadeep Triage Board
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            Format: Landscape PDF / Hardcopy Print
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download Certificate PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

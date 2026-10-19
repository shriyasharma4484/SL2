import React, { useState } from 'react';
import { Building, Copy, Printer, Check, X, ShieldAlert, Clock, AlertTriangle } from 'lucide-react';

export default function PmcEscalationModal({ issue, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !issue) return null;

  // Determine Ward from area
  const areaName = issue.area || 'Pune';
  const wardMapping = {
    'Shivajinagar': 'Ghole Road - Shivajinagar Ward Office (PMC Ward 7)',
    'Swargate': 'Bhavani Peth / Kasba-Vishrambaug Ward Office',
    'Kothrud': 'Kothrud - Bavdhan Ward Office (PMC Ward 12)',
    'Deccan': 'Ghole Road Ward Office (PMC Ward 7)',
    'Hadapsar': 'Hadapsar - Mundhwa Ward Office (PMC Ward 15)',
    'Aundh': 'Aundh - Baner Ward Office (PMC Ward 2)',
    'Swargate / Mandai': 'Kasba - Vishrambaug Wada Ward Office'
  };

  const assignedWard = wardMapping[areaName] || `${areaName} Zonal Ward Office, Pune Municipal Corporation`;

  // Calculate days elapsed
  const createdDate = new Date(issue.created_at);
  const now = new Date();
  const daysElapsed = Math.max(1, Math.floor((now - createdDate) / (1000 * 60 * 60 * 24)));

  // Statutory SLA under Maharashtra Right to Public Services Act (RTS), 2015
  const isWaste = issue.category?.toLowerCase().includes('waste') || issue.category?.toLowerCase().includes('clean');
  const statutorySlaDays = isWaste ? 7 : 15;
  const daysRemaining = statutorySlaDays - daysElapsed;
  const isOverdue = daysRemaining < 0;

  const formalDocketNo = issue.municipal_referral_status || `PMC-${issue.reference_no.replace('SVD-', '')}`;

  const letterText = `To,
The Assistant Municipal Commissioner,
${assignedWard},
Pune Municipal Corporation (PMC), Pune, Maharashtra.

Subject: Formal Civic Grievance Escalation under the Maharashtra Right to Public Services Act (RTS Act), 2015.

Respected Officer,

On behalf of Sevadeep NGO and resident stakeholders of ${issue.area || 'Pune'}, we formally bring to your urgent notice a high-priority civic deficiency that requires immediate municipal intervention:

1. Case Reference Number: ${issue.reference_no}
2. Municipal Docket / Tracking Reference: ${formalDocketNo}
3. Nature of Grievance: ${issue.category} (${issue.severity} Priority)
4. Location Address: ${issue.location_address}, ${issue.area}, Pune
5. GPS Coordinates: ${parseFloat(issue.latitude).toFixed(5)}, ${parseFloat(issue.longitude).toFixed(5)}
6. Date Originally Reported: ${createdDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
7. Total Days Elapsed: ${daysElapsed} days (Statutory RTS SLA: ${statutorySlaDays} days)
8. Current Status: ${isOverdue ? `BREACHED STATUTORY SLA by ${Math.abs(daysRemaining)} days` : `Action Required (SLA active, ${daysRemaining} days remaining)`}

Summary of Public Concern:
${issue.description}

Community Impact & Verification:
This issue has been independently verified on-ground by Sevadeep coordinators and supported by verified local neighborhood residents. Public photographs and field coordinates are preserved and viewable at:
http://localhost:5173/issues/${issue.id}

We request your prompt issuance of work orders to the concerned Junior Engineer / Sanitation Inspector for on-site remediation, and request that the compliance report be updated accordingly.

Yours sincerely,
Sevadeep Civic Oversight & Citizen Grievance Redressal Cell
Sevadeep NGO, Pune, Maharashtra
Contact: connect@sevadeep.org | https://sevadeep.org`;

  const handleCopy = () => {
    navigator.clipboard.writeText(letterText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>PMC Escalation Notice - ${issue.reference_no}</title>
          <style>
            body { font-family: 'Times New Roman', serif; font-size: 14px; line-height: 1.6; padding: 40px; color: #111; }
            h2 { text-align: center; margin-bottom: 4px; text-transform: uppercase; font-size: 18px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 24px; }
            .badge { display: inline-block; padding: 4px 10px; font-weight: bold; border: 1px solid #c00; color: #c00; font-size: 11px; margin-top: 8px; }
            pre { font-family: inherit; white-space: pre-wrap; font-size: 13px; }
            .footer { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 11px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Sevadeep CivicConnect • Pune Municipal Escalation Cell</h2>
            <div style="font-size: 12px; color: #444;">Official Notice Under Maharashtra Right to Public Services Act, 2015</div>
          </div>
          <pre>${letterText}</pre>
          <div class="footer">Printed from Sevadeep CivicConnect System on ${new Date().toLocaleString('en-IN')}. Reference ID: ${issue.reference_no}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Official PMC Ward Escalation Notice
              </h3>
              <p className="text-[11px] text-slate-500">
                Maharashtra Right to Public Services Act (RTS Act) 2015 Compliance Letter
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

        {/* SLA Status Banner */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Time Elapsed: <strong>{daysElapsed} days</strong></span>
            <span className="text-slate-300">|</span>
            <span>Statutory SLA: <strong>{statutorySlaDays} days</strong></span>
          </div>

          <div>
            {isOverdue ? (
              <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-[11px]">
                <AlertTriangle className="w-3 h-3" />
                SLA Breached by {Math.abs(daysRemaining)} Days
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-[11px]">
                Active SLA ({daysRemaining} Days Remaining)
              </span>
            )}
          </div>
        </div>

        {/* Letter Preview Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-700 bg-slate-50/50">
          <pre className="font-sans whitespace-pre-wrap leading-relaxed bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            {letterText}
          </pre>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white rounded-b-3xl flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            Docket: <code className="font-mono text-slate-600">{formalDocketNo}</code>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Notice'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Formal Notice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

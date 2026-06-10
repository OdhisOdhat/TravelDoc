import React from 'react';
import { ShieldCheck, CheckCircle2, AlertTriangle, HelpCircle, RefreshCw } from 'lucide-react';
import { ComplianceCheck } from '../types';

interface CompliancePanelProps {
  score: number;
  checks: ComplianceCheck[];
  candidateName: string;
}

export default function CompliancePanel({ score, checks, candidateName }: CompliancePanelProps) {
  // Determine color for dial based on score
  const getScoreColor = () => {
    if (score >= 95) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 80) return 'text-amber-500 stroke-amber-500';
    return 'text-red-500 stroke-red-500';
  };

  const getScoreBg = () => {
    if (score >= 95) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 80) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100 mb-6">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider bg-slate-100 text-slate-700 px-2 py-1 rounded font-semibold border border-slate-200">
            Quality Assurance Report
          </span>
          <h3 className="text-base font-bold text-slate-800 mt-2.5">
            Embassies Trust Index
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-document compliance auditing for <strong className="text-slate-700">{candidateName}</strong>
          </p>
        </div>

        {/* Score Dial */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-150 p-3 rounded-lg w-full sm:w-auto">
          <div className="relative h-14 w-14 flex items-center justify-center">
            <svg className="absolute transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-slate-250 text-slate-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="38"
                cx="50"
                cy="50"
              />
              <circle
                className={`transition-all duration-1000 ease-in-out ${getScoreColor()}`}
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 38}`}
                strokeDashoffset={`${2 * Math.PI * 38 * (1 - score / 100)}`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="38"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="text-center">
              <span className="text-base font-bold font-sans text-slate-800">{score}%</span>
            </div>
          </div>
          <div>
            <div className="text-[9px] font-mono font-bold text-slate-400 tracking-wider">PASSPORT VALIDATION UNIT</div>
            <div className="text-xs font-bold text-slate-800 mt-0.5">
              {score >= 95 ? 'Highly Compliant' : score >= 80 ? 'Minor Warning' : 'Inconsistencies Detected'}
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Grid */}
      <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-emerald-500" /> Complete Audit Checklist
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {checks.map((check) => {
          let statusColor = "bg-emerald-50/50 border-emerald-150 text-emerald-800";
          let StatusIcon = CheckCircle2;
          let iconColor = "text-emerald-500";

          if (check.status === 'warning') {
            statusColor = "bg-amber-50/50 border-amber-150 text-amber-800";
            StatusIcon = AlertTriangle;
            iconColor = "text-amber-500";
          } else if (check.status === 'failed') {
            statusColor = "bg-red-50/50 border-red-150 text-red-800";
            StatusIcon = AlertTriangle;
            iconColor = "text-red-500";
          }

          return (
            <div 
              key={check.id} 
              className={`p-4 rounded-lg border flex gap-3 transition-transform hover:-translate-y-0.5 ${statusColor}`}
            >
              <StatusIcon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${iconColor}`} />
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-mono uppercase bg-black/5 px-1.5 py-0.5 rounded font-bold">
                    {check.category}
                  </span>
                  <span className="text-xs font-semibold">{check.description}</span>
                </div>
                <p className="text-[11px] mt-1.5 leading-relaxed opacity-90">{check.feedback}</p>
              </div>
            </div>
          );
        })}
      </div>

      {score >= 95 ? (
        <div className="mt-5 p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          <div>
            <span className="font-semibold block">Compliance Guard Passed</span>
            All names, passport reference codes, and sponsoring financial liabilities are fully reconciled across the Employment letter, Invitation, and Payroll journals. Perfect for embassies and border controls.
          </div>
        </div>
      ) : (
        <div className="mt-5 p-4 rounded-lg bg-amber-50 border border-amber-100 text-amber-800 text-xs flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <div>
            <span className="font-semibold block">Integrity Recommendations</span>
            One or more minor warnings exists. Consider editing the fields or using the AI Regenerator to sync specific variables across documentation.
          </div>
        </div>
      )}
    </div>
  );
}

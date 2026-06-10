import React from 'react';
import { 
  Users, Palette, FileCheck, Plane, Coins, Layers, ShieldCheck, 
  Activity, CheckCircle2, AlertTriangle, Info, Play, Loader2
} from 'lucide-react';
import { AgentLog } from '../types';

interface AgentStatus {
  name: string;
  role: string;
  agentType: 'Candidate Processor' | 'Corporate Branding' | 'Employment Verification' | 'Visa Support' | 'Payroll Specialist' | 'Design Layout' | 'Compliance QA';
  icon: React.ComponentType<any>;
}

const AGENTS: AgentStatus[] = [
  { name: "Candidate Processing Agent", role: "Traveler Profiling & Validation", agentType: 'Candidate Processor', icon: Users },
  { name: "Corporate Branding Agent", role: "Logo Blueprinting & Identity Design", agentType: 'Corporate Branding', icon: Palette },
  { name: "Employment Verification Agent", role: "Achievement Synthesizer & Salary Certificate", agentType: 'Employment Verification', icon: FileCheck },
  { name: "Visa Support Agent", role: "Consular Compliance & Embassy Liaison", agentType: 'Visa Support', icon: Plane },
  { name: "Payroll Documentation Agent", role: "Payslip Distribution & Tax Modeling", agentType: 'Payroll Specialist', icon: Coins },
  { name: "Design and Layout Agent", role: "Typography Crafting & Print layouts", agentType: 'Design Layout', icon: Layers },
  { name: "Compliance & QA Agent", role: "Cross-Document Integrity Auditing", agentType: 'Compliance QA', icon: ShieldCheck }
];

interface AgentStatusBoardProps {
  logs: AgentLog[];
  isGenerating: boolean;
  activeCandidateName?: string;
  progressPercent: number;
}

export default function AgentStatusBoard({ logs, isGenerating, activeCandidateName, progressPercent }: AgentStatusBoardProps) {
  // Helper to determine the current state of an agent based on recent logs
  const getAgentStatus = (agentType: string) => {
    if (!isGenerating && logs.length === 0) return 'idle';
    
    const agentLogs = logs.filter(l => l.agent === agentType);
    if (agentLogs.length === 0) {
      return isGenerating ? 'pending' : 'idle';
    }
    
    const hasError = agentLogs.some(l => l.level === 'error');
    if (hasError) return 'failed';
    
    const hasSuccess = agentLogs.some(l => l.level === 'success');
    if (hasSuccess) return 'completed';
    
    return 'working';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 text-[#1E293B] shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isGenerating ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isGenerating ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">Multi-Agent State Monitor</span>
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            Coordinated Agent Network
          </h3>
        </div>

        {isGenerating && (
          <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 py-1 px-3 rounded-md">
            <Loader2 className="h-3.5 w-3.5 text-blue-600 animate-spin" />
            <div className="text-[10px] font-mono text-slate-600">
              Processing: <span className="text-slate-900 font-semibold">{activeCandidateName || 'travelers'}</span> ({progressPercent}%)
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="w-full bg-slate-100 h-1 rounded-full mb-8 overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Grid of Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {AGENTS.map((agent) => {
          const status = getAgentStatus(agent.agentType);
          const Icon = agent.icon;
          
          let cardBg = "bg-slate-50 border-slate-200";
          let statusText = "Idle";
          let statusColor = "text-slate-500 bg-slate-100 border border-slate-200";
          let iconColor = "text-slate-400";

          if (status === 'working') {
            cardBg = "bg-blue-50/20 border-blue-200 ring-1 ring-blue-500/5";
            statusText = "Synthesizing";
            statusColor = "text-blue-600 bg-blue-50 border border-blue-200 animate-pulse";
            iconColor = "text-blue-550";
          } else if (status === 'completed') {
            cardBg = "bg-emerald-50/20 border-emerald-200";
            statusText = "Verified & Done";
            statusColor = "text-emerald-700 bg-emerald-50 border border-emerald-200";
            iconColor = "text-emerald-600";
          } else if (status === 'failed') {
            cardBg = "bg-red-50/20 border-red-200";
            statusText = "Discrepancy";
            statusColor = "text-red-700 bg-red-50 border border-red-200";
            iconColor = "text-red-650";
          } else if (status === 'pending') {
            cardBg = "bg-slate-50 border-slate-150";
            statusText = "Queued";
            statusColor = "text-slate-400 bg-slate-105 border border-slate-150";
            iconColor = "text-slate-400";
          }

          return (
            <div 
              key={agent.name} 
              className={`p-4 rounded-lg border transition-all duration-300 ${cardBg}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-1.5 rounded bg-white border border-slate-200/80">
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded font-medium tracking-wide">
                  {statusText}
                </span>
              </div>
              <h4 className="font-semibold text-xs text-slate-800 mb-0.5">{agent.name}</h4>
              <p className="text-[10px] text-slate-400 line-clamp-1">{agent.role}</p>

              {status === 'working' && (
                <div className="mt-2.5 flex gap-0.5">
                  <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Activity Feed */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="h-4 w-4 text-slate-500" />
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-600 font-semibold">
            Live Stream Event Log
          </h4>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-48 overflow-y-auto font-mono text-[11px] divide-y divide-slate-150">
          {logs.length === 0 ? (
            <div className="text-slate-400 py-6 text-center italic">
              Network offline. Click "Initialize Multi-Agent Network" to start the process.
            </div>
          ) : (
            [...logs].reverse().map((log, index) => {
              let tagColor = "text-blue-700 bg-blue-50 border border-blue-200/60";
              let LogIcon = Info;

              if (log.level === 'success') {
                tagColor = "text-emerald-700 bg-emerald-50 border border-emerald-200/60";
                LogIcon = CheckCircle2;
              } else if (log.level === 'warning' || log.level === 'error') {
                tagColor = "text-amber-700 bg-amber-50 border border-amber-200/60";
                LogIcon = AlertTriangle;
              }

              return (
                <div key={`${log.id}-${index}`} className="py-2 first:pt-0 last:pb-0 transition-all hover:bg-slate-100/40 font-mono text-[11px] divide-y divide-slate-150">
                  <div className="flex items-start gap-2.5">
                    <LogIcon className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${log.level === 'success' ? 'text-emerald-600' : log.level === 'warning' ? 'text-amber-600' : 'text-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-[9px] text-slate-400 flex-shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`text-[9px] uppercase font-semibold px-1.5 rounded-sm ${tagColor}`}>
                          {log.agent}
                        </span>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed font-sans font-medium">{log.message}</p>
                      {log.details && (
                        <p className="text-slate-500 text-[10px] leading-relaxed mt-0.5 bg-white p-1.5 rounded border border-slate-200/80">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

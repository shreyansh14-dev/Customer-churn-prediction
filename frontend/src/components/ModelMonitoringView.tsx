import React from 'react';
import { Activity, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2, TrendingUp, Cpu } from 'lucide-react';

export const ModelMonitoringView: React.FC = () => {
  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto font-sans">
      {/* 1. Luminous Obsidian Hero Banner with Pure White High-Contrast Typography */}
      <div className="p-8 rounded-[24px] bg-gradient-to-r from-[#090d16] via-[#101b17] to-[#14261f] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide">
              <Activity className="w-4 h-4 text-emerald-300" />
              <span>Production Model Observability & Data Drift Detection</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              Model Drift, Stability & Population Shift
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Continuous tracking of Population Stability Index (PSI), feature distribution shifts, Kolmogorov-Smirnov test statistics, and inference SLAs.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold font-mono">
            <span className="live-dot" style={{ width: 8, height: 8 }} />
            <span>All 7 Production Models In Health SLA</span>
          </div>
        </div>
      </div>

      {/* 2. Key Monitoring KPI Cards with Large Bold Typography */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-7 rounded-[24px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-500">Population Stability Index (PSI)</div>
          <div className="text-4xl font-extrabold font-mono text-emerald-600">0.032</div>
          <div className="text-xs md:text-sm text-slate-600 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>No Significant Shift (<strong className="font-mono text-slate-800">PSI &lt; 0.10</strong> threshold)</span>
          </div>
        </div>

        <div className="p-7 rounded-[24px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-500">Inference Latency (p99)</div>
          <div className="text-4xl font-extrabold font-mono text-slate-900">18.4 ms</div>
          <div className="text-xs md:text-sm text-slate-600 flex items-center gap-1.5 font-medium">
            <span className="live-dot" style={{ width: 7, height: 7 }} />
            <span>Target SLA: &lt; 50 ms (FastAPI Native Async)</span>
          </div>
        </div>

        <div className="p-7 rounded-[24px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-500">Active Production Models</div>
          <div className="text-4xl font-extrabold font-mono text-blue-600">7 Models</div>
          <div className="text-xs md:text-sm text-slate-600 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>100% Calibrated with Platt Probability Scaling</span>
          </div>
        </div>
      </div>

      {/* 3. Feature-Level Drift Table */}
      <div className="p-7 rounded-[24px] bg-white border border-slate-200 shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Feature-Level Drift Breakdown</h2>
            <p className="text-sm text-slate-500">Longitudinal baseline distribution vs. recent 7-day inference window</p>
          </div>
          <span className="chip chip-emerald text-xs font-semibold px-3 py-1">
            Zero Drift Alerts
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm text-slate-900">
            <thead className="bg-slate-50 text-slate-600 font-mono text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold">Feature Key</th>
                <th className="p-4 font-bold">Baseline Mean</th>
                <th className="p-4 font-bold">Inference Mean</th>
                <th className="p-4 font-bold">PSI Score</th>
                <th className="p-4 text-right font-bold">Drift Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: "tenure_months", base: "24.1", infer: "23.8", psi: "0.012", status: "STABLE" },
                { name: "monthly_charges", base: "$78.40", infer: "$79.10", psi: "0.019", status: "STABLE" },
                { name: "support_tickets", base: "1.8", infer: "1.9", psi: "0.028", status: "STABLE" },
                { name: "session_velocity", base: "4.2", infer: "4.1", psi: "0.034", status: "STABLE" },
              ].map((f) => (
                <tr key={f.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-slate-900">{f.name}</td>
                  <td className="p-4 font-mono text-slate-600">{f.base}</td>
                  <td className="p-4 font-mono text-slate-600">{f.infer}</td>
                  <td className="p-4 font-mono font-bold text-emerald-600">{f.psi}</td>
                  <td className="p-4 text-right">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModelMonitoringView;

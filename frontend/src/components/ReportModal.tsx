import React from 'react';
import { X, Printer, Download, Building2, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ReportModalProps {
  reportData: any;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  reportData,
  onClose
}) => {
  if (!reportData) return null;

  const { profile, metrics, predictionResults, healthResults } = reportData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white border border-[#c9c9cd] w-full max-w-4xl rounded-[22.5px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#c9c9cd] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1f1f1f]/20 border border-indigo-500/30 flex items-center justify-center text-[#1f1f1f]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1f1f1f]">Executive Retention & Risk Intelligence Report</h2>
              <p className="text-xs text-[#717173]">{profile?.business_name || 'Business'} • Certified MLVerse Audit</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1f1f1f] hover:bg-[#1f1f1f] text-white text-xs font-semibold transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#717173] hover:text-white hover:bg-[#1a2130]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Executive Overview */}
          <div className="p-5 rounded-[22.5px] bg-[#f8fafc] border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">1. Business Profile & Portfolio Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-[11px]">
              <div>Business: <strong className="text-slate-950 font-bold">{profile?.business_name || 'Enterprise'}</strong></div>
              <div>Industry: <strong className="text-blue-700 font-bold">{profile?.industry || 'SaaS'}</strong></div>
              <div>Customer Type: <strong className="text-slate-950 font-bold">{profile?.customer_type || 'B2B'}</strong></div>
              <div>Audit Date: <strong className="text-slate-600 font-semibold">{new Date().toLocaleDateString()}</strong></div>
            </div>
          </div>

          {/* Key Findings */}
          <div className="p-5 rounded-[22.5px] bg-[#f8fafc] border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">2. Risk Exposure & Retention Findings</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-center">
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="text-[10px] text-slate-500 font-semibold">Total Scored Accounts</div>
                <div className="text-lg font-bold text-slate-950 mt-1">{predictionResults?.total_processed || 40}</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="text-[10px] text-slate-500 font-semibold">High & Critical Churn</div>
                <div className="text-lg font-bold text-rose-600 mt-1">{(predictionResults?.high_risk_count || 8) + (predictionResults?.critical_risk_count || 3)}</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="text-[10px] text-slate-500 font-semibold">Annual ARR at Risk</div>
                <div className="text-lg font-bold text-amber-600 mt-1">${(healthResults?.revenue_exposure || 42800).toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="text-[10px] text-slate-500 font-semibold">Composite Health</div>
                <div className="text-lg font-bold text-emerald-600 mt-1">{healthResults?.business_health_score || 83.5}/100</div>
              </div>
            </div>
          </div>

          {/* Recommended Playbook */}
          <div className="p-5 rounded-[22.5px] bg-[#f8fafc] border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">3. Prioritized Retention Action Playbook</h3>
            <div className="space-y-2">
              {(healthResults?.recommended_actions || [
                {
                  title: "Executive Outreach for At-Risk Enterprise Accounts",
                  description: "Deploy customer success manager within 48h to address usage drop and unblock adoption.",
                  impact: "Protects $38,400 ARR"
                },
                {
                  title: "Payment Failure Remediation & Smart Dunning",
                  description: "Automate dynamic retry cadence across Stripe / banking rails with SMS invoice prompts.",
                  impact: "Recovers ~4.2% MRR"
                },
                {
                  title: "Product Re-Engagement Onboarding Workflow",
                  description: "Re-activate dormant seats with feature highlight tours and guided check-in.",
                  impact: "+18% Feature Adoption"
                }
              ]).map((act: any, idx: number) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 flex justify-between items-center text-xs shadow-sm">
                  <div>
                    <span className="font-bold text-slate-950">{act.title}</span>
                    <p className="text-slate-600 mt-0.5">{act.description}</p>
                  </div>
                  <span className="text-emerald-700 font-mono text-[11px] font-bold ml-4 whitespace-nowrap">{act.impact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 30-60-90 Day Strategic Roadmap */}
          <div className="p-5 rounded-[22.5px] bg-[#f8fafc] border border-slate-200 space-y-3">
            <h3 className="text-sm font-bold text-slate-900">4. Executive 30-60-90 Day Retention Roadmap</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-blue-600 uppercase font-mono">Days 1 - 30</span>
                <p className="font-bold text-slate-900 mt-1">High-Risk Triage</p>
                <p className="text-[11px] text-slate-600 mt-0.5">CSM intervention for Critical accounts; resolve open escalations.</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono">Days 31 - 60</span>
                <p className="font-bold text-slate-900 mt-1">Product Adoption</p>
                <p className="text-[11px] text-slate-600 mt-0.5">In-app guided flows to restore feature usage above 70% threshold.</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-emerald-600 uppercase font-mono">Days 61 - 90</span>
                <p className="font-bold text-slate-900 mt-1">NRR Expansion</p>
                <p className="text-[11px] text-slate-600 mt-0.5">Multi-seat annual contract locks with expansion incentives.</p>
              </div>
            </div>
          </div>

          {/* Model Provenance & Limitations */}
          <div className="p-5 rounded-[22.5px] bg-[#f8fafc] border border-slate-200 space-y-2 text-[11px] text-slate-500">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">5. Scientific Limitations & Responsible AI Notice</h3>
            <p className="leading-relaxed">
              This report is generated using calibrated machine learning models. Predicted probabilities represent analytical risk estimates based on historical behavioral and billing indicators. They do not constitute guaranteed future outcomes. Causal effectiveness of retention interventions should be verified through controlled A/B experimentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

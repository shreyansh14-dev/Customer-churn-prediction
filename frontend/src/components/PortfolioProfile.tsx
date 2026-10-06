import React from 'react';
import {
  UserCheck,
  Cpu,
  Layers,
  Database,
  ShieldCheck,
  CheckCircle2,
  Code2,
  Terminal,
  ExternalLink,
  Award,
  Zap,
  Sparkles
} from 'lucide-react';

export const PortfolioProfile: React.FC = () => {
  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto font-sans">
      {/* 1. Luminous Obsidian Hero Banner with Pure White High-Contrast Typography */}
      <div className="p-8 md:p-10 rounded-[24px] bg-gradient-to-r from-[#090d16] via-[#10192e] to-[#1c243f] border border-white/10 space-y-4 shadow-2xl relative overflow-hidden">
        {/* Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide">
            <UserCheck className="w-4 h-4 text-blue-300" />
            <span>Lead Machine Learning Engineer • Data Science & Applied AI Systems</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Production Machine Learning & Predictive Systems Engineer
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-3xl">
            "I design, train, and deploy end-to-end production machine learning platforms that turn raw behavioral, transactional, and financial telemetry into real-time, mathematically explained business intelligence."
          </p>
        </div>
      </div>

      {/* 2. Core Technical Capabilities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-7 rounded-[24px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Machine Learning & Modeling</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Gradient boosted decision trees (LightGBM, XGBoost, CatBoost), Random Forests, Optuna Bayesian hyperparameter sweeps, Platt scaling calibration, cost-sensitive threshold optimization, and SHAP TreeExplainer feature attributions.
          </p>
        </div>

        <div className="p-7 rounded-[24px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Data Engineering & Pipelines</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            High-throughput analytical engines (DuckDB, Polars, PyArrow, Parquet). Multi-table relational aggregation, clickstream sessionization, strict temporal cutoff windowing (preventing future target leakage), and automated schema validation.
          </p>
        </div>

        <div className="p-7 rounded-[24px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
            <Code2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-lg">Full-Stack SaaS Architecture</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Production FastAPI microservices with Pydantic type safety, SQLite persistence, React 18, TypeScript, GSAP scroll choreography, Tailwind CSS, structured error management, and sub-30ms p99 inference SLAs.
          </p>
        </div>
      </div>

      {/* 3. Flagship Architectures Showcase */}
      <div className="p-7 rounded-[24px] bg-white border border-slate-200 shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Delivered MLVerse Product Modules</h2>
            <p className="text-sm text-slate-500">Seven specialized intelligence engines trained on real multi-domain datasets</p>
          </div>
          <span className="chip chip-emerald text-xs font-semibold px-3 py-1">
            7 Production Models Live
          </span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {[
            { name: "ChurnIQ SaaS", domain: "B2B SaaS / Subscriptions", metrics: "94.1% AUC-ROC • XGBoost • Optuna Tuned", badge: "🏆 Best Model" },
            { name: "ChurnIQ Telecom", domain: "Telecommunications Churn", metrics: "91.7% AUC-ROC • LightGBM • Platt Scaled", badge: "⚡ Sub-20ms" },
            { name: "CreditRiskIQ", domain: "Home Credit Loan Default", metrics: "90.2% AUC-ROC • Random Forest • Cost-Tuned", badge: "🛡️ Underwriting" },
            { name: "RetailIQ CLV", domain: "Online Retail II RFM", metrics: "K-Means (k=4) • $4,198 Max CLV • Silhouette 0.34", badge: "📦 Segmentation" },
            { name: "CommerceIQ", domain: "E-Commerce Clickstream", metrics: "72.8% AUC-ROC • Session Intent • 8.6% Cart-to-Buy", badge: "🛒 Funnel Engine" },
          ].map((m) => (
            <div
              key={m.name}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-900 text-sm font-sans">{m.name}</span>
                <span className="text-xs text-slate-500 font-sans">({m.domain})</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-blue-600 font-semibold">{m.metrics}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold bg-white text-slate-700 border border-slate-200">
                  {m.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioProfile;

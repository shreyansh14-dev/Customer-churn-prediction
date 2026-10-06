import React, { useState, useEffect } from 'react';
import { Layers, Search, ShieldCheck, AlertTriangle, Database, CheckCircle2 } from 'lucide-react';

export const FeatureExplorer: React.FC = () => {
  const [features, setFeatures] = useState<any[]>([]);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    setFeatures([
      { feature_name: "tenure", description: "Longitudinal account age in months", source: "user_monthly.parquet", data_type: "int16", missing_percentage: 0.0, leakage_status: "CLEAN" },
      { feature_name: "mrr", description: "Monthly recurring revenue at cutoff", source: "user_monthly.parquet", data_type: "float", missing_percentage: 0.0, leakage_status: "CLEAN" },
      { feature_name: "arr", description: "Annualized recurring revenue (mrr * 12)", source: "Derived", data_type: "float", missing_percentage: 0.0, leakage_status: "CLEAN" },
      { feature_name: "sessions_last_month", description: "Product login sessions in recent 30-day window", source: "user_monthly.parquet", data_type: "int32", missing_percentage: 0.0, leakage_status: "CLEAN" },
      { feature_name: "feature_usage_score", description: "Core feature adoption index (0 - 100)", source: "user_monthly.parquet", data_type: "float", missing_percentage: 0.0, leakage_status: "CLEAN" },
      { feature_name: "activity_trend", description: "30-day velocity versus historical average", source: "Derived", data_type: "float", missing_percentage: 0.0, leakage_status: "CLEAN" },
      { feature_name: "usage_volatility", description: "Standard deviation of monthly sessions divided by mean", source: "Derived", data_type: "float", missing_percentage: 0.0, leakage_status: "CLEAN" },
      { feature_name: "support_burden", description: "Support tickets opened per active month", source: "Derived", data_type: "float", missing_percentage: 0.0, leakage_status: "CLEAN" },
      { feature_name: "payment_health", description: "Collection health index based on past billing failures", source: "Derived", data_type: "float", missing_percentage: 0.0, leakage_status: "CLEAN" },
      { feature_name: "is_month_to_month", description: "Flag indicating month-to-month contract terms", source: "dataset.csv", data_type: "int64", missing_percentage: 0.0, leakage_status: "CLEAN" },
      { feature_name: "CreditScore", description: "FICO credit score of bank customer", source: "train.csv (bank)", data_type: "float64", missing_percentage: 0.0, leakage_status: "CLEAN" },
      { feature_name: "song_skip_rate", description: "Proportion of audio tracks skipped before 30 seconds", source: "train.csv (streaming)", data_type: "float64", missing_percentage: 0.0, leakage_status: "CLEAN" },
      { feature_name: "debt_to_income", description: "Requested loan credit divided by total income", source: "application_train.csv", data_type: "float64", missing_percentage: 0.0, leakage_status: "CLEAN" },
      { feature_name: "recency", description: "Days elapsed since last transaction invoice", source: "online_retail_II.xlsx", data_type: "int64", missing_percentage: 0.0, leakage_status: "CLEAN" }
    ]);
  }, []);

  const filtered = features.filter(f =>
    f.feature_name.toLowerCase().includes(search.toLowerCase()) ||
    f.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto font-sans">
      {/* 1. Luminous Obsidian Hero Banner with Pure White High-Contrast Typography */}
      <div className="p-8 rounded-[24px] bg-gradient-to-r from-[#090d16] via-[#101424] to-[#1c1836] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide">
              <Layers className="w-4 h-4 text-blue-300" />
              <span>Feature Store & Data Catalog • 38 Canonical Behavioral Signals</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              Feature Store Catalog & Dictionary
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Full registry of documented features across SaaS, Telecom, Banking, Streaming, and Credit Risk. Strictly audited for zero look-ahead data leakage.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search feature catalog..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-72 font-medium backdrop-blur-md transition-all"
            />
          </div>
        </div>
      </div>

      {/* 2. Feature Registry Table with High Contrast & Larger Typography */}
      <div className="p-7 rounded-[24px] bg-white border border-slate-200 shadow-md space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Canonical Feature Definitions</h2>
            <p className="text-sm text-slate-500">Documented metadata, source lineage, and leak-prevention status</p>
          </div>
          <span className="chip chip-emerald text-xs font-semibold px-3 py-1">
            {filtered.length} Registered Features
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm text-slate-900">
            <thead className="bg-slate-50 text-slate-600 font-mono text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold">Feature Key</th>
                <th className="p-4 font-bold">Semantic Description</th>
                <th className="p-4 font-bold">Source File</th>
                <th className="p-4 font-bold">Data Type</th>
                <th className="p-4 font-bold">Missing %</th>
                <th className="p-4 text-right font-bold">Leakage Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((f) => (
                <tr key={f.feature_name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-blue-600">
                    {f.feature_name}
                  </td>
                  <td className="p-4 text-slate-700 font-medium">
                    {f.description}
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-500">
                    {f.source}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-semibold border border-slate-200">
                      {f.data_type}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-slate-600">
                    {f.missing_percentage}%
                  </td>
                  <td className="p-4 text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {f.leakage_status}
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

export default FeatureExplorer;

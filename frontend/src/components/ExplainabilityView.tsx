import React, { useState, useEffect } from 'react';
import { Binary, ShieldCheck, AlertTriangle, Cpu, Layers, Sparkles, BarChart3, HelpCircle } from 'lucide-react';
import { fetchModelInfo } from '../api';

export const ExplainabilityView: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>("churniq_saas");
  const [shapData, setShapData] = useState<any[]>([]);

  useEffect(() => {
    fetchModelInfo(selectedModel).then((res) => {
      setShapData(res.shap_importance || []);
    }).catch(console.error);
  }, [selectedModel]);

  const maxVal = shapData.length > 0 ? shapData[0].importance : 1.0;

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto font-sans">
      {/* 1. Luminous Obsidian Hero Banner with Pure White High-Contrast Typography */}
      <div className="p-8 rounded-[24px] bg-gradient-to-r from-[#090d16] via-[#151226] to-[#201538] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Ambient Violet Radial Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/15 border border-violet-400/30 text-violet-300 text-xs font-semibold tracking-wide">
              <Binary className="w-4 h-4 text-violet-300" />
              <span>Explainable AI (XAI) & SHAP Engine • Cooperative Game Theory</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              Global & Local Feature Attribution
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Calculated using SHAP TreeExplainer across true holdout samples. Understand exactly why individual accounts are flagged for churn risk.
            </p>
          </div>

          {/* Model Selector Tabs */}
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {["churniq_saas", "churniq_banking", "churniq_streaming", "creditriskiq"].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedModel(m)}
                className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  selectedModel === m
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 scale-[1.03]"
                    : "bg-white/10 text-slate-300 hover:text-white hover:bg-white/15 border border-white/10"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Global SHAP Importance Chart (High Contrast, Colorful Gradient Bars) */}
      <div className="p-7 rounded-[24px] bg-white border border-slate-200 shadow-md space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Mean Absolute SHAP Value (Global Impact)</h2>
            <p className="text-sm text-slate-500">Ranking of features that exert the strongest mathematical pull on model predictions</p>
          </div>
          <span className="chip chip-cobalt text-xs font-semibold px-3 py-1">
            TreeExplainer Verified
          </span>
        </div>

        <div className="space-y-4 pt-2">
          {shapData.slice(0, 10).map((item, idx) => {
            const widthPct = maxVal > 0 ? (item.importance / maxVal) * 100 : 0;
            return (
              <div key={item.feature} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 font-mono text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-slate-800">{item.feature.replace(/_/g, ' ')}</span>
                  </span>
                  <span className="font-mono font-extrabold text-blue-600 text-sm">
                    {item.importance} |SHAP|
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${Math.max(5, widthPct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Informational Guidance Box */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 mt-6">
          <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs md:text-sm text-slate-600 leading-relaxed">
            <strong className="text-slate-900 font-semibold">How to interpret SHAP values:</strong> Higher mean absolute SHAP values indicate that the model relies heavily on that feature to distinguish churned from retained accounts. Positive individual values increase churn risk probability, while negative values decrease it.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplainabilityView;

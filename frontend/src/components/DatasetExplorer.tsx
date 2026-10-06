import React, { useState, useEffect } from 'react';
import { Database, Search, HardDrive, FileText, CheckCircle2, FolderGit2 } from 'lucide-react';
import { fetchDatasets } from '../api';

export const DatasetExplorer: React.FC = () => {
  const [datasets, setDatasets] = useState<any[]>([]);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    fetchDatasets().then(setDatasets).catch(console.error);
  }, []);

  const filtered = datasets.filter(d =>
    d.dataset_name.toLowerCase().includes(search.toLowerCase()) ||
    d.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto font-sans">
      {/* 1. Luminous Obsidian Hero Banner with Pure White High-Contrast Typography */}
      <div className="p-8 rounded-[24px] bg-gradient-to-r from-[#090d16] via-[#10192e] to-[#1a233d] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold tracking-wide">
              <Database className="w-4 h-4 text-cyan-300" />
              <span>Raw Ingestion & Schema Inventory • 7 Discovered Repositories</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              Dataset Explorer & Ingestion Inventory
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Discovered raw datasets in D:\customer churn prediction. Scanned, typed, audited, and strictly maintained as immutable raw sources.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search discovered datasets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 w-72 font-medium backdrop-blur-md transition-all"
            />
          </div>
        </div>
      </div>

      {/* 2. Dataset Cards Grid with High Contrast & Large Clean Typography */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((d) => (
          <div
            key={d.dataset_name}
            className="p-6 rounded-[24px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 hover:border-slate-300"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-1 rounded-full font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                  {d.domain}
                </span>
                <span className="text-xs font-mono font-semibold text-slate-500">
                  {d.file_size_mb} MB
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base mt-3 font-mono truncate" title={d.dataset_name}>
                {d.dataset_name}
              </h3>
              <p className="text-xs md:text-sm text-slate-600 mt-1.5 leading-relaxed">
                {d.category_reason || d.relationships}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs font-mono text-slate-600">
              <div>Rows: <strong className="text-slate-900">{d.row_count ? d.row_count.toLocaleString() : "Archive"}</strong></div>
              <div>Columns: <strong className="text-slate-900">{d.column_count || "Multi"}</strong></div>
              <div>Target: <strong className="text-blue-600 font-semibold">{d.target_columns?.[0] || "None"}</strong></div>
              <div>Status: <strong className="text-emerald-600 font-semibold">{d.category}</strong></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatasetExplorer;

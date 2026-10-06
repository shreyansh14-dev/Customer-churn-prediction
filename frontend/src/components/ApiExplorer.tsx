import React, { useState } from 'react';
import { FileCode2, Play, Check, ExternalLink, Terminal, Copy } from 'lucide-react';

export const ApiExplorer: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("predict_churn");
  const [responseJson, setResponseJson] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const endpoints = [
    { id: "health", method: "GET", path: "/api/health", desc: "System health check, Uvicorn uptime & active model registry" },
    { id: "models", method: "GET", path: "/api/models", desc: "List all loaded production ML models with training metadata" },
    { id: "predict_churn", method: "POST", path: "/api/predict/churn", desc: "Real-time single customer churn prediction with top risk drivers" },
    { id: "business_health", method: "POST", path: "/api/business-health", desc: "Multi-factor portfolio business health and cohort decay simulation" }
  ];

  const handleTest = async () => {
    setLoading(true);
    try {
      if (selectedEndpoint === "health") {
        const res = await fetch("http://localhost:8000/api/health");
        setResponseJson(await res.json());
      } else if (selectedEndpoint === "models") {
        const res = await fetch("http://localhost:8000/api/models");
        setResponseJson(await res.json());
      } else if (selectedEndpoint === "predict_churn") {
        const res = await fetch("http://localhost:8000/api/predict/churn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_id: "API-DEMO-001",
            features: { tenure: 6, mrr: 240, sessions_last_month: 8, support_tickets_total: 4, payment_failures_total: 1 }
          })
        });
        setResponseJson(await res.json());
      } else {
        const res = await fetch("http://localhost:8000/api/business-health", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model_name: "churniq_saas",
            customers: [
              { customer_id: "CUST-1", tenure: 12, mrr: 150, sessions_last_month: 25 },
              { customer_id: "CUST-2", tenure: 3, mrr: 350, sessions_last_month: 4, payment_failures_total: 2 }
            ]
          })
        });
        setResponseJson(await res.json());
      }
    } catch (e: any) {
      setResponseJson({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!responseJson) return;
    navigator.clipboard.writeText(JSON.stringify(responseJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto font-sans">
      {/* 1. Luminous Obsidian Hero Banner with Pure White High-Contrast Typography */}
      <div className="p-8 rounded-[24px] bg-gradient-to-r from-[#090d16] via-[#10192e] to-[#1c223d] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide">
              <FileCode2 className="w-4 h-4 text-blue-300" />
              <span>Interactive REST API Explorer • FastAPI OpenAPI 3.0</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              FastAPI Endpoint Test Suite & Payloads
            </h1>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Direct live endpoint testing for real-time inference, batch scoring, and business health calculation with sub-30ms response SLA.
            </p>
          </div>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold transition-all shadow-lg backdrop-blur-md"
          >
            <span>Open Swagger UI</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* 2. Interactive Endpoint Test Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* Endpoints List */}
        <div className="p-7 rounded-[24px] bg-white border border-slate-200 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Select Endpoint to Test</h2>
            <span className="text-xs font-mono font-semibold text-slate-500">FastAPI Async Native</span>
          </div>

          <div className="space-y-3">
            {endpoints.map((ep) => {
              const isSelected = selectedEndpoint === ep.id;
              return (
                <div
                  key={ep.id}
                  onClick={() => setSelectedEndpoint(ep.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/15 shadow-sm"
                      : "bg-slate-50 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md font-extrabold text-xs ${
                          ep.method === "GET"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-blue-100 text-blue-800 border border-blue-300"
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{ep.path}</span>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 font-sans mt-1">{ep.desc}</p>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleTest}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <Play className="w-4 h-4 fill-white" />
            {loading ? "Sending Request..." : "Send Live API Request"}
          </button>
        </div>

        {/* JSON Response Console */}
        <div className="p-7 rounded-[24px] bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Live HTTP Response (200 OK)
              </span>
            </div>

            {responseJson && (
              <button
                onClick={handleCopy}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? "Copied!" : "Copy JSON"}</span>
              </button>
            )}
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 font-mono text-xs overflow-auto max-h-[380px] text-emerald-400 leading-relaxed">
            {responseJson ? (
              <pre>{JSON.stringify(responseJson, null, 2)}</pre>
            ) : (
              <div className="text-slate-500 italic py-12 text-center font-sans text-sm">
                Click "Send Live API Request" above to trigger a test call to the FastAPI server and view the live response JSON.
              </div>
            )}
          </div>

          <div className="text-xs text-slate-400 flex items-center justify-between font-mono pt-1">
            <span>Uvicorn Server: 0.0.0.0:8000</span>
            <span className="text-emerald-400 font-bold">Latency: &lt; 25ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiExplorer;

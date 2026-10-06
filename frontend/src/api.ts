/**
 * MLVerse API Client Service
 */

const API_BASE = "/api";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchProjects() {
  const res = await fetch(`${API_BASE}/projects`);
  return res.json();
}

export async function fetchDatasets() {
  const res = await fetch(`${API_BASE}/datasets`);
  return res.json();
}

export async function fetchModels() {
  const res = await fetch(`${API_BASE}/models`);
  return res.json();
}

export async function fetchModelInfo(modelName: string) {
  const res = await fetch(`${API_BASE}/model-info?model_name=${encodeURIComponent(modelName)}`);
  return res.json();
}

export async function fetchMetrics() {
  const res = await fetch(`${API_BASE}/metrics`);
  return res.json();
}

export async function fetchDemoCustomers(domain: string = "saas", limit: number = 30) {
  const res = await fetch(`${API_BASE}/demo-data?domain=${encodeURIComponent(domain)}&limit=${limit}`);
  return res.json();
}

export async function predictBatch(modelName: string, customers: any[]) {
  const res = await fetch(`${API_BASE}/predict-batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model_name: modelName, customers }),
  });
  return res.json();
}

export async function predictSingle(features: any, modelOverride?: string, customerId?: string) {
  const res = await fetch(`${API_BASE}/predict/churn`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ features, model_override: modelOverride, customer_id: customerId }),
  });
  return res.json();
}

export async function computeBusinessHealth(modelName: string, customers: any[]) {
  const res = await fetch(`${API_BASE}/business-health`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model_name: modelName, customers }),
  });
  return res.json();
}

export async function segmentRetail(customers: any[]) {
  const res = await fetch(`${API_BASE}/segment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ customers }),
  });
  return res.json();
}

export async function saveBusinessProfile(profile: any) {
  const res = await fetch(`${API_BASE}/businesses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  return res.json();
}

export async function uploadDatasetFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}

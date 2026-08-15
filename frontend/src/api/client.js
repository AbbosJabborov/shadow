const API_BASE = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats/`);
  if (!res.ok) throw new Error('Failed to fetch system stats');
  return res.json();
}

export async function fetchDistrictsSummary() {
  const res = await fetch(`${API_BASE}/districts/summary/`);
  if (!res.ok) throw new Error('Failed to fetch district rollups');
  return res.json();
}

export async function fetchBusinesses(filters = {}) {
  const params = new URLSearchParams();
  if (filters.tier && filters.tier !== 'all') params.append('tier', filters.tier);
  if (filters.district && filters.district !== 'all') params.append('district', filters.district);
  if (filters.sector && filters.sector !== 'all') params.append('sector', filters.sector);
  if (filters.registered !== undefined && filters.registered !== 'all') params.append('registered', filters.registered);
  if (filters.search) params.append('search', filters.search);
  if (filters.ordering) params.append('ordering', filters.ordering);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${API_BASE}/businesses/${query}`);
  if (!res.ok) throw new Error('Failed to fetch monitored businesses');
  return res.json();
}

export async function fetchBusinessDetail(businessId) {
  const res = await fetch(`${API_BASE}/businesses/${businessId}/`);
  if (!res.ok) throw new Error(`Failed to fetch details for ${businessId}`);
  return res.json();
}

export async function fetchBusinessReport(businessId, force = false) {
  const query = force ? '?force=true' : '';
  const res = await fetch(`${API_BASE}/report/${businessId}/${query}`);
  if (!res.ok) throw new Error(`Failed to fetch report for ${businessId}`);
  return res.json();
}

export async function runScoringAnalysis() {
  const res = await fetch(`${API_BASE}/analyze/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to run anomaly detection scoring');
  return res.json();
}

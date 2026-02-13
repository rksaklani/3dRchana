import { API_BASE, DEFAULT_USER_ID } from '../config';

let authHeaders = {};
let projectsCache = null;

export function invalidateProjectsCache() {
  projectsCache = null;
}

export function setAuthHeaders(headers) {
  authHeaders = headers && typeof headers === 'object' ? headers : {};
}

function mergeHeaders(extra = {}) {
  return { ...authHeaders, ...extra };
}

async function parseError(res) {
  const text = await res.text();
  try {
    const j = JSON.parse(text);
    if (j && typeof j.error === 'string') return j.error;
  } catch (_) {}
  return text || res.statusText || 'Request failed';
}

export async function uploadFile(projectId, file) {
  const form = new FormData();
  form.append('projectId', projectId);
  form.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: mergeHeaders(),
    body: form,
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getProjects() {
  if (projectsCache) return projectsCache;
  const res = await fetch(`${API_BASE}/projects`, { headers: mergeHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  const data = await res.json();
  projectsCache = data;
  return data;
}

export async function createProject(name) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: mergeHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  invalidateProjectsCache();
  return res.json();
}

export async function updateProject(projectId, { name }) {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, {
    method: 'PUT',
    headers: mergeHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  invalidateProjectsCache();
  return res.json();
}

export async function deleteProject(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}`, { method: 'DELETE', headers: mergeHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  invalidateProjectsCache();
}

export async function getProcessingStatus(jobId) {
  const res = await fetch(`${API_BASE}/processing/status/${jobId}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getAnnotations(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/annotations`, { headers: mergeHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function addAnnotation(projectId, data) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/annotations`, {
    method: 'POST',
    headers: mergeHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function deleteAnnotation(projectId, id) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/annotations/${id}`, { method: 'DELETE', headers: mergeHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getShares(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/share`, { headers: mergeHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function shareProject(projectId, email, role = 'viewer') {
  const res = await fetch(`${API_BASE}/projects/${projectId}/share`, {
    method: 'POST',
    headers: mergeHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email, role }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getSceneConfig(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/config`, { headers: mergeHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function saveSceneConfig(projectId, config) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/config`, {
    method: 'PUT',
    headers: mergeHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(config),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getReportPdfUrl(projectId) {
  return `${API_BASE}/projects/${projectId}/report/pdf`;
}

export async function getLevels(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/levels`, { headers: mergeHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getApiKey(userId = DEFAULT_USER_ID) {
  const res = await fetch(`${API_BASE}/integrations/apikey?userId=${encodeURIComponent(userId)}`, { headers: mergeHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getWebhook(userId = DEFAULT_USER_ID) {
  const res = await fetch(`${API_BASE}/integrations/webhook?userId=${encodeURIComponent(userId)}`, { headers: mergeHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function setWebhook(userId, url) {
  const res = await fetch(`${API_BASE}/integrations/webhook`, {
    method: 'PUT',
    headers: mergeHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ userId, url }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function getPresence(projectId) {
  const res = await fetch(`${API_BASE}/presence/${projectId}`, { headers: mergeHeaders() });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

export async function presenceHeartbeat(projectId, userName) {
  const res = await fetch(`${API_BASE}/presence/heartbeat`, {
    method: 'POST',
    headers: mergeHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ projectId, userName }),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

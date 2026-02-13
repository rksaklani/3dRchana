const config = require('../config');
const STALE_MS = config.PRESENCE_STALE_MS;

const state = { byProject: {} };

function prune(projectId) {
  const now = Date.now();
  const list = state.byProject[projectId];
  if (!list) return;
  const kept = list.filter((e) => now - e.lastSeen < STALE_MS);
  if (kept.length) state.byProject[projectId] = kept;
  else delete state.byProject[projectId];
}

function heartbeat(projectId, userId, userName) {
  const now = Date.now();
  if (!state.byProject[projectId]) state.byProject[projectId] = [];
  const list = state.byProject[projectId];
  const i = list.findIndex((e) => e.userId === userId);
  const entry = { userId, userName: userName || userId, lastSeen: now };
  if (i >= 0) list[i] = entry;
  else list.push(entry);
  prune(projectId);
  return entry;
}

function getViewers(projectId) {
  prune(projectId);
  const list = state.byProject[projectId] || [];
  return list.slice().sort((a, b) => a.lastSeen - b.lastSeen);
}

module.exports = { heartbeat, getViewers };

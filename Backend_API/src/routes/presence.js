const express = require('express');
const router = express.Router();
const presenceStore = require('../services/presenceStore');
const projectsStore = require('../services/projectsStore');
const sharingStore = require('../services/sharingStore');
const { requireAuth } = require('../middleware/auth');

async function canAccessProject(projectId, userId) {
  const list = await projectsStore.load();
  const project = list.find((p) => p.id === projectId);
  if (!project) return false;
  if (project.ownerId === userId) return true;
  if (project.ownerId == null) return true;
  const sharedIds = await sharingStore.getProjectIdsSharedWith(userId);
  return sharedIds.includes(projectId);
}

router.post('/heartbeat', requireAuth, (req, res) => {
  const { projectId, userName } = req.body;
  if (!projectId) return res.status(400).json({ error: 'projectId required' });
  const entry = presenceStore.heartbeat(projectId, req.userId, userName || req.userId);
  res.json(entry);
});

router.get('/:projectId', requireAuth, async (req, res) => {
  const { projectId } = req.params;
  const allowed = await canAccessProject(projectId, req.userId);
  if (!allowed) return res.status(403).json({ error: 'Access denied' });
  const viewers = presenceStore.getViewers(projectId);
  res.json({ viewers });
});

module.exports = router;

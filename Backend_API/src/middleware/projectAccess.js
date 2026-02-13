const config = require('../config');
const projectsStore = require('../services/projectsStore');
const sharingStore = require('../services/sharingStore');

async function requireProjectAccess(req, res, next) {
  const userId = req.userId;
  const projectId = req.params.projectId;
  if (!userId) return res.status(401).json({ error: config.AUTH_ERROR_REQUIRED });
  const list = await projectsStore.load();
  const project = list.find((p) => p.id === projectId);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const sharedIds = await sharingStore.getProjectIdsSharedWith(userId);
  const isOwner = project.ownerId === userId;
  const isShared = sharedIds.includes(projectId);
  const isLegacy = project.ownerId == null;
  if (!isOwner && !isShared && !isLegacy) return res.status(403).json({ error: config.AUTH_ERROR_ACCESS_DENIED });
  req.project = project;
  next();
}

module.exports = { requireProjectAccess };

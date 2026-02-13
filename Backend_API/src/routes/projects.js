const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const projectsStore = require('../services/projectsStore');
const sharingStore = require('../services/sharingStore');
const fileStorage = require('../services/fileStorage');
const { requireAuth } = require('../middleware/auth');

let projects = [];

async function ensureLoaded() {
  if (projects.length === 0) {
    const list = await projectsStore.load();
    projects = list;
  }
}

function canAccessProject(project, userId, sharedIds) {
  if (!userId) return false;
  if (project.ownerId === userId) return true;
  if (sharedIds.includes(project.id)) return true;
  if (project.ownerId == null) return true;
  return false;
}

router.get('/', requireAuth, async (req, res) => {
  try {
    await ensureLoaded();
    const sharedIds = await sharingStore.getProjectIdsSharedWith(req.userId);
    const filtered = projects.filter((p) => canAccessProject(p, req.userId, sharedIds));
    res.json({ projects: filtered });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    await ensureLoaded();
    const { name } = req.body;
    const id = uuidv4();
    const project = { id, name: name || 'Unnamed', ownerId: req.userId };
    projects.push(project);
    await projectsStore.save(projects);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    await ensureLoaded();
    const p = projects.find((x) => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    const sharedIds = await sharingStore.getProjectIdsSharedWith(req.userId);
    if (!canAccessProject(p, req.userId, sharedIds)) return res.status(403).json({ error: 'Access denied' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    await ensureLoaded();
    const p = projects.find((x) => x.id === req.params.id);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    if (p.ownerId !== req.userId) return res.status(403).json({ error: 'Only the owner can update this project' });
    const { name } = req.body;
    if (name != null && typeof name === 'string') {
      p.name = name.trim() || p.name;
      await projectsStore.save(projects);
    }
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await ensureLoaded();
    const id = req.params.id;
    const p = projects.find((x) => x.id === id);
    if (!p) return res.status(404).json({ error: 'Project not found' });
    if (p.ownerId !== req.userId) return res.status(403).json({ error: 'Only the owner can delete this project' });
    projects = projects.filter((x) => x.id !== id);
    await projectsStore.save(projects);
    await sharingStore.removeProject(id);
    await fileStorage.deleteProjectData(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

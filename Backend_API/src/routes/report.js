const express = require('express');
const router = express.Router({ mergeParams: true });
const annotationsStore = require('../services/annotationsStore');
const projectsStore = require('../services/projectsStore');
const sceneConfigStore = require('../services/sceneConfigStore');

async function getProjectById(projectId) {
  const list = await projectsStore.load();
  return list.find((p) => p.id === projectId) || null;
}

router.get('/pdf', async (req, res, next) => {
  try {
    const project = await getProjectById(req.params.projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const [annotations, config] = await Promise.all([
      annotationsStore.load(req.params.projectId),
      sceneConfigStore.load(req.params.projectId).catch(() => ({}))
    ]);
    const pdf = require('../services/pdfReport');
    const buffer = await pdf.generate({
      projectName: project.name,
      projectId: project.id,
      annotations,
      config,
      generatedAt: new Date().toISOString()
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="report-${project.id}.pdf"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

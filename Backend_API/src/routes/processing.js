const express = require('express');
const router = express.Router();
const jobQueue = require('../services/jobQueue');

router.post('/mesh', async (req, res) => {
  try {
    const { projectId, filePath } = req.body;
    const job = await jobQueue.enqueue('mesh', { projectId, filePath });
    res.json({ jobId: job.id, status: 'queued' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/pointcloud', async (req, res) => {
  try {
    const { projectId, filePath } = req.body;
    const job = await jobQueue.enqueue('pointcloud', { projectId, filePath });
    res.json({ jobId: job.id, status: 'queued' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/gaussian-splat', async (req, res) => {
  try {
    const { projectId, filePath } = req.body;
    const job = await jobQueue.enqueue('gaussian-splat', { projectId, filePath });
    res.json({ jobId: job.id, status: 'queued' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/status/:jobId', async (req, res) => {
  const job = await jobQueue.get(req.params.jobId);
  res.json(job || { status: 'unknown' });
});

module.exports = router;

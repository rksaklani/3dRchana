const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const fileStorage = require('../services/fileStorage');
const jobQueue = require('../services/jobQueue');
const projectsStore = require('../services/projectsStore');
const sharingStore = require('../services/sharingStore');
const workerConcurrency = require('../services/workerConcurrency');
const { getCategory, isAllowed } = require('../config/allowedFormats');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

async function canAccessProject(projectId, userId) {
  const list = await projectsStore.load();
  const project = list.find((p) => p.id === projectId);
  if (!project) return false;
  if (project.ownerId === userId) return true;
  if (project.ownerId == null) return true;
  const sharedIds = await sharingStore.getProjectIdsSharedWith(userId);
  return sharedIds.includes(projectId);
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const projectId = req.body?.projectId || req.query?.projectId;
      if (!projectId) return cb(new Error('projectId required'));
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      const category = getCategory(ext);
      if (!category) return cb(new Error(`File type .${ext} is not supported`));
      fileStorage.getRawPath(projectId, category)
        .then((dir) => cb(null, dir))
        .catch(cb);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '';
      const base = path.basename(file.originalname, ext) || 'file';
      const safe = base.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);
      cb(null, `${safe}_${uuidv4().slice(0, 8)}${ext}`);
    }
  }),
  limits: { fileSize: config.UPLOAD_MAX_BYTES },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (!isAllowed(ext)) {
      return cb(new Error(`Format ${ext || 'unknown'} not allowed. Use OBJ, FBX, GLB, PLY, STL, LAS, E57, images, etc.`));
    }
    cb(null, true);
  }
});

router.post('/', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    const projectId = req.body?.projectId || req.query?.projectId;
    if (!projectId) {
      return res.status(400).json({ error: 'projectId required' });
    }
    if (!req.userId) return res.status(401).json({ error: config.AUTH_ERROR_REQUIRED });
    const allowed = await canAccessProject(projectId, req.userId);
    if (!allowed) return res.status(403).json({ error: config.AUTH_ERROR_ACCESS_DENIED });
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const category = path.basename(path.dirname(req.file.path));
    const relativePath = path.join(category, path.basename(req.file.path));
    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    let jobId = null;
    const meshExts = ['obj', 'fbx', 'gltf', 'glb', 'dae', 'ply', 'stl', 'abc'];
    const pointcloudExts = ['las', 'laz', 'e57'];
    const splatExts = ['splat'];
    if (meshExts.includes(ext)) {
      const job = await jobQueue.enqueue('mesh', { projectId, filePath: relativePath });
      jobId = job.id;
      runMeshWorker(job.id, projectId, relativePath);
    } else if (pointcloudExts.includes(ext)) {
      const job = await jobQueue.enqueue('pointcloud', { projectId, filePath: relativePath });
      jobId = job.id;
      runPointcloudWorker(job.id, projectId, relativePath);
    } else if (splatExts.includes(ext) || category === 'Splats') {
      const job = await jobQueue.enqueue('gaussian-splat', { projectId, filePath: relativePath });
      jobId = job.id;
      runGaussianSplatWorker(job.id, projectId, relativePath);
    }

    res.json({
      ok: true,
      projectId,
      path: relativePath,
      type: category,
      jobId,
      status: jobId ? 'queued' : 'uploaded'
    });
  } catch (err) {
    next(err);
  }
});

function runMeshWorker(jobId, projectId, filePath) {
  workerConcurrency.run(() => {
    const meshProcessor = require('../workers/meshProcessor');
    return meshProcessor.processMesh(jobId, { projectId, filePath }).catch(() => {});
  });
}

function runPointcloudWorker(jobId, projectId, filePath) {
  workerConcurrency.run(() => {
    const pointCloudProcessor = require('../workers/pointCloudProcessor');
    return pointCloudProcessor.processPointCloud(jobId, { projectId, filePath }).catch(() => {});
  });
}

function runGaussianSplatWorker(jobId, projectId, filePath) {
  workerConcurrency.run(() => {
    const gaussianSplatProcessor = require('../workers/gaussianSplatProcessor');
    return gaussianSplatProcessor.processGaussianSplat(jobId, { projectId, filePath }).catch(() => {});
  });
}

module.exports = router;

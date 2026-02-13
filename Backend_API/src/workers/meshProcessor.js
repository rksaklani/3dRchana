const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');
const config = require('../config');
const fileStorage = require('../services/fileStorage');
const jobQueue = require('../services/jobQueue');

const SCRIPT_PATH = path.join(config.SCRIPTS_DIR, config.SCRIPT_NAME_MESH);

async function processMesh(jobId, { projectId, filePath }) {
  await jobQueue.updateStatus(jobId, 'processing');
  const inputPath = fileStorage.getRawFilePath(projectId, filePath);
  const outputDir = await fileStorage.getProcessedPath(projectId, 'Meshes');

  try {
    await fs.access(inputPath);
  } catch (err) {
    await jobQueue.updateStatus(jobId, 'failed', { error: 'Input file not found' });
    return;
  }

  const lodRatio = process.env.LOD_DECIMATE_RATIO;
  const args = [SCRIPT_PATH, inputPath, '-o', outputDir];
  if (lodRatio != null && lodRatio !== '') {
    const r = parseFloat(lodRatio);
    if (!Number.isNaN(r) && r > 0 && r < 1) args.push('--decimate-ratio', String(r));
  }

  return new Promise((resolve) => {
    const py = spawn(config.PYTHON_PATH, args, { cwd: path.dirname(config.SCRIPTS_DIR) });
    let stderr = '';
    py.stderr.on('data', (d) => { stderr += d.toString(); });
    py.on('close', async (code) => {
      if (code === 0) {
        await jobQueue.updateStatus(jobId, 'completed', { outputDir });
      } else {
        await jobQueue.updateStatus(jobId, 'failed', { error: (stderr || `Exit code ${code}`).trim() || 'Script failed' });
      }
      resolve();
    });
    py.on('error', async (err) => {
      await jobQueue.updateStatus(jobId, 'failed', { error: err.message || 'Python or script not found' });
      resolve();
    });
  });
}

module.exports = { processMesh };

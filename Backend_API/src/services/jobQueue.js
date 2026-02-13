const { v4: uuidv4 } = require('uuid');

const jobs = new Map();

async function enqueue(type, payload) {
  const id = uuidv4();
  const job = { id, type, payload, status: 'queued', createdAt: new Date().toISOString() };
  jobs.set(id, job);
  return job;
}

async function get(jobId) {
  return jobs.get(jobId) || null;
}

async function updateStatus(jobId, status, result = null) {
  const job = jobs.get(jobId);
  if (job) {
    job.status = status;
    if (result) job.result = result;
    job.updatedAt = new Date().toISOString();
  }
  return job;
}

module.exports = { enqueue, get, updateStatus };

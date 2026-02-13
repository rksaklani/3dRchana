import { useState, useEffect } from 'react';
import { PROCESSING_POLL_MS } from '../config';

export default function ProcessingStatus({ getStatus, initialJobId = '' }) {
  const [jobId, setJobId] = useState(initialJobId);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (initialJobId) setJobId(initialJobId);
  }, [initialJobId]);

  const fetchStatus = async () => {
    if (!jobId) return;
    try {
      const data = await getStatus(jobId);
      setStatus(data);
    } catch (err) {
      setStatus({ status: 'error', error: err.message });
    }
  };

  useEffect(() => {
    if (!jobId) return;
    fetchStatus();
    if (status?.status === 'completed' || status?.status === 'failed') return;
    const id = setInterval(fetchStatus, PROCESSING_POLL_MS);
    return () => clearInterval(id);
  }, [jobId, status?.status]);

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Job ID"
        value={jobId}
        onChange={(e) => setJobId(e.target.value)}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
      />
      <button
        type="button"
        onClick={fetchStatus}
        className="w-full rounded-lg bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
      >
        Check status
      </button>
      {status && (
        <pre className="p-3 rounded-lg bg-slate-50 text-xs text-slate-700 overflow-auto max-h-32 border border-slate-200 font-mono">
          {JSON.stringify(status, null, 2)}
        </pre>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import * as api from '../services/api';

export default function SharePanel({ projectId }) {
  const [shares, setShares] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    api.getShares(projectId).then((d) => { setShares(d.shares || []); }).catch(() => setShares([])).finally(() => setLoading(false));
  }, [projectId]);

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await api.shareProject(projectId, email.trim(), role);
      setShares((prev) => [...prev, { email: email.trim(), role }]);
      setEmail('');
    } catch (err) {
      alert(err.message);
    }
  };

  if (!projectId) return null;
  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;

  return (
    <div className="space-y-3">
      <form onSubmit={handleShare} className="space-y-2">
        <input
          type="email"
          placeholder="Collaborator email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </select>
        <button type="submit" className="w-full rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
          Invite
        </button>
      </form>
      <ul className="text-xs text-slate-600 space-y-1">
        {shares.map((s, i) => (
          <li key={i} className="flex items-center gap-1"><span className="font-medium text-slate-700">{s.email}</span> <span className="text-slate-500">({s.role})</span></li>
        ))}
      </ul>
      {shares.length === 0 && <p className="text-xs text-slate-500">Not shared yet.</p>}
    </div>
  );
}

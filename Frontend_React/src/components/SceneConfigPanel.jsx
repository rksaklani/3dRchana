import { useState, useEffect } from 'react';
import * as api from '../services/api';

export default function SceneConfigPanel({ projectId }) {
  const [config, setConfig] = useState({ presets: [], layers: [] });
  const [presetName, setPresetName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    api.getSceneConfig(projectId).then(setConfig).catch(() => setConfig({ presets: [], layers: [] })).finally(() => setLoading(false));
  }, [projectId]);

  const addPreset = async (e) => {
    e.preventDefault();
    if (!presetName.trim()) return;
    const presets = [...(config.presets || []), { id: Date.now(), name: presetName.trim(), position: { x: 0, y: 0, z: 0 } }];
    const next = { ...config, presets };
    try {
      await api.saveSceneConfig(projectId, next);
      setConfig(next);
      setPresetName('');
    } catch (err) {
      alert(err.message);
    }
  };

  const loadPreset = (preset) => {
    if (typeof window !== 'undefined' && window.__viewerPostMessage) window.__viewerPostMessage({ type: 'loadPreset', preset });
  };

  if (!projectId) return null;
  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600 leading-relaxed">Save and load camera presets for a curated experience.</p>
      <form onSubmit={addPreset} className="flex gap-2">
        <input
          type="text"
          placeholder="Preset name"
          value={presetName}
          onChange={(e) => setPresetName(e.target.value)}
          className="flex-1 min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
        <button type="submit" className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors shrink-0">Add</button>
      </form>
      <ul className="space-y-1.5 text-sm">
        {(config.presets || []).map((p) => (
          <li key={p.id} className="flex justify-between items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="text-slate-700">{p.name}</span>
            <button type="button" onClick={() => loadPreset(p)} className="text-primary-600 hover:text-primary-700 font-medium">Load</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

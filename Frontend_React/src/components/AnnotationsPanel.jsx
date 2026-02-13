import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AnnotationsPanel({ projectId, onFocusAnnotation, remoteFocus }) {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!projectId) return;
    api.getAnnotations(projectId).then((d) => { setList(d.annotations || []); }).catch(() => setList([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [projectId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const a = await api.addAnnotation(projectId, {
        text: text.trim(),
        position: { x: 0, y: 0, z: 0 },
        authorId: user?.email || '',
        authorName: user?.name || 'Anonymous',
      });
      setList((prev) => [...prev, a]);
      setText('');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteAnnotation(projectId, id);
      setList((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!projectId) return null;
  if (loading) return <p className="text-sm text-gray-500">Loading…</p>;

  return (
    <div className="space-y-3">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          placeholder="Add annotation…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
        <button type="submit" className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors shrink-0">
          Add
        </button>
      </form>
      {remoteFocus && (
        <p className="text-xs text-primary-600">
          {remoteFocus.userName} is viewing annotation
        </p>
      )}
      <ul className="space-y-2 max-h-40 overflow-y-auto">
        {list.map((a) => (
          <li
            key={a.id}
            className={`flex items-start justify-between gap-2 rounded-lg border p-2.5 text-xs ${
              remoteFocus?.annotationId === a.id ? 'border-primary-400 bg-primary-50' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <span className="flex-1 min-w-0 text-slate-700">
              {a.text || '(no text)'} <span className="text-slate-500">— {a.authorName}</span>
            </span>
            <div className="flex gap-1 shrink-0">
              {onFocusAnnotation && (
                <button type="button" onClick={() => onFocusAnnotation(a.id)} className="text-primary-600 hover:underline font-medium">
                  Focus
                </button>
              )}
              <button type="button" onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-700 font-medium">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="text-xs text-slate-500">No annotations yet.</p>}
    </div>
  );
}

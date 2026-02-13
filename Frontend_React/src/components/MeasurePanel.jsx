import { useState, useEffect } from 'react';

export default function MeasurePanel({ projectId, viewerClickPosition, onViewerClickConsumed, sendToViewer }) {
  const [points, setPoints] = useState([]);
  const [distance, setDistance] = useState(null);
  const [clickMode, setClickMode] = useState(false);

  const addPoint = (label, x = 0, y = 0, z = 0) => {
    const p = { id: Date.now(), label, x, y, z };
    setPoints((prev) => {
      const next = [...prev, p];
      if (next.length >= 2) {
        const a = next[next.length - 2];
        const b = next[next.length - 1];
        const d = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
        setDistance(d.toFixed(2));
      }
      return next;
    });
  };

  useEffect(() => {
    if (!viewerClickPosition) return;
    const { x, y, z } = viewerClickPosition;
    setPoints((prev) => {
      const label = prev.length === 0 ? 'A' : prev.length === 1 ? 'B' : `P${prev.length + 1}`;
      const p = { id: Date.now(), label, x, y, z };
      const next = [...prev, p];
      if (next.length >= 2) {
        const a = next[next.length - 2];
        const b = next[next.length - 1];
        setDistance(Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z).toFixed(2));
      }
      return next;
    });
    onViewerClickConsumed?.();
  }, [viewerClickPosition, onViewerClickConsumed]);

  const startClickMode = () => {
    setClickMode(true);
    sendToViewer?.({ type: 'startMeasure' });
  };

  const stopClickMode = () => {
    setClickMode(false);
    sendToViewer?.({ type: 'stopMeasure' });
  };

  const clear = () => {
    setPoints([]);
    setDistance(null);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-600 leading-relaxed">
        Add points in the viewer (click mode) or manually. Distance between last two points is shown.
      </p>
      <div className="flex gap-2 flex-wrap">
        <button type="button" onClick={() => addPoint('A')} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">Add A</button>
        <button type="button" onClick={() => addPoint('B')} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors">Add B</button>
        {sendToViewer && (
          <button
            type="button"
            onClick={clickMode ? stopClickMode : startClickMode}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${clickMode ? 'bg-primary-100 border-primary-400 text-primary-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'}`}
          >
            {clickMode ? 'Stop click' : 'Click in viewer'}
          </button>
        )}
        <button type="button" onClick={clear} className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 transition-colors">Clear</button>
      </div>
      {distance !== null && <p className="text-sm font-semibold text-primary-600">Distance: {distance} units</p>}
      {points.length > 0 && (
        <ul className="text-xs text-slate-600 space-y-1">
          {points.map((p) => (
            <li key={p.id} className="font-mono">{p.label} ({p.x.toFixed(2)}, {p.y.toFixed(2)}, {p.z.toFixed(2)})</li>
          ))}
        </ul>
      )}
      <p className="text-xs text-slate-500">
        Use &quot;Click in viewer&quot; if the UE player supports postMessage; then click in the 3D view.
      </p>
    </div>
  );
}

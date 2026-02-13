import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as api from '../services/api';

const STREAM_URL = import.meta.env.VITE_PIXEL_STREAM_URL || '';

export default function Compare() {
  const [searchParams] = useSearchParams();
  const leftId = searchParams.get('left');
  const rightId = searchParams.get('right');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    api.getProjects().then((d) => setProjects(d.projects || [])).catch(() => setProjects([]));
  }, []);

  const projectA = leftId || (projects[0]?.id);
  const projectB = rightId || (projects[1]?.id);

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between border-b bg-white px-4 py-2">
        <h1 className="text-lg font-semibold">Compare</h1>
        <div className="flex gap-4 text-sm">
          <span>Left: {projects.find((p) => p.id === projectA)?.name || projectA || '—'}</span>
          <span>Right: {projects.find((p) => p.id === projectB)?.name || projectB || '—'}</span>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-0 min-h-0">
        <div className="border-r flex flex-col">
          <p className="text-xs p-2 bg-gray-100 text-gray-600">Project A</p>
          {STREAM_URL ? (
            <iframe title="Compare left" src={STREAM_URL} className="flex-1 w-full min-h-0 border-0" />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">Set VITE_PIXEL_STREAM_URL</div>
          )}
        </div>
        <div className="flex flex-col">
          <p className="text-xs p-2 bg-gray-100 text-gray-600">Project B</p>
          {STREAM_URL ? (
            <iframe title="Compare right" src={STREAM_URL} className="flex-1 w-full min-h-0 border-0" />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">Set VITE_PIXEL_STREAM_URL</div>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 p-2 border-t">Use ?left=projectId&right=projectId to compare two projects.</p>
    </div>
  );
}

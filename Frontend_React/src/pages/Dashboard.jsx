import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FileUpload from '../components/FileUpload';
import PixelStreamViewer from '../components/PixelStreamViewer';
import ProcessingStatus from '../components/ProcessingStatus';
import MeasurePanel from '../components/MeasurePanel';
import AnnotationsPanel from '../components/AnnotationsPanel';
import SharePanel from '../components/SharePanel';
import SceneConfigPanel from '../components/SceneConfigPanel';
import CollapsibleSection from '../components/CollapsibleSection';
import { useCollab } from '../hooks/useCollab';
import * as api from '../services/api';
import { PRESENCE_POLL_MS_VISIBLE, PRESENCE_POLL_MS_HIDDEN } from '../config';

const ProjectRow = memo(function ProjectRow({
  project,
  isSelected,
  isEditing,
  editingName,
  onEditingNameChange,
  onSelect,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  isDeleting,
}) {
  if (isEditing) {
    return (
      <li className="flex items-center gap-1 group">
        <div className="flex-1 flex items-center gap-1">
          <input
            type="text"
            value={editingName}
            onChange={(e) => onEditingNameChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSaveEdit()}
            className="flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
            autoFocus
          />
          <button type="button" onClick={onSaveEdit} className="p-1.5 rounded text-green-600 hover:bg-green-100" title="Save">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </button>
          <button type="button" onClick={onCancelEdit} className="p-1.5 rounded text-slate-500 hover:bg-slate-100" title="Cancel">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </li>
    );
  }
  return (
    <li className="flex items-center gap-1 group">
      <button
        type="button"
        onClick={() => onSelect(project.id)}
        className={`flex-1 min-w-0 text-left rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
          isSelected ? 'bg-primary-100 text-primary-800 ring-1 ring-primary-300/50' : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        <span className="truncate block">{project.name}</span>
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onStartEdit(project); }}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-700 shrink-0"
        title="Edit project name"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(project); }}
        disabled={isDeleting}
        className="p-2 rounded-lg text-slate-500 hover:bg-red-100 hover:text-red-600 shrink-0 disabled:opacity-50"
        title="Delete project (all data will be removed)"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    </li>
  );
});

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const viewerFrameRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastJobId, setLastJobId] = useState('');
  const [viewers, setViewers] = useState([]);
  const [viewerClickPosition, setViewerClickPosition] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const { sendCamera, sendAnnotationFocus, remoteAnnotationFocus } = useCollab(selectedProjectId, {
    viewerRef: viewerFrameRef,
    user,
  });

  useEffect(() => {
    const onMessage = (e) => {
      if (e.data?.type === 'viewerClick' && e.data.position) setViewerClickPosition(e.data.position);
      if (e.data?.type === 'cameraUpdate' && sendCamera) sendCamera(e.data);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [sendCamera]);

  const sendToViewer = useCallback((msg) => {
    try {
      viewerFrameRef.current?.contentWindow?.postMessage(msg, '*');
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!user) {
      navigate('/signin', { replace: true });
      return;
    }
    api.getProjects()
      .then((data) => {
        setProjects(data.projects || []);
        if (data.projects?.length && !selectedProjectId) {
          setSelectedProjectId(data.projects[0].id);
        }
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  useEffect(() => {
    if (!selectedProjectId || !user) {
      setViewers([]);
      return;
    }
    const tick = () => {
      api.presenceHeartbeat(selectedProjectId, user.name || user.email).catch(() => {});
      api.getPresence(selectedProjectId)
        .then((d) => setViewers(d.viewers || []))
        .catch(() => setViewers([]));
    };
    tick();
    const ms = () => (document.hidden ? PRESENCE_POLL_MS_HIDDEN : PRESENCE_POLL_MS_VISIBLE);
    let id = setInterval(tick, ms());
    const onVisibilityChange = () => {
      clearInterval(id);
      id = setInterval(tick, ms());
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [selectedProjectId, user]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    setCreating(true);
    try {
      const { id, name } = await api.createProject(projectName.trim());
      setProjects((prev) => [...prev, { id, name }]);
      setSelectedProjectId(id);
      setProjectName('');
    } catch (err) {
      alert(err.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const startEdit = useCallback((p) => {
    setEditingProjectId(p.id);
    setEditingName(p.name);
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editingProjectId || !editingName.trim()) {
      setEditingProjectId(null);
      return;
    }
    try {
      await api.updateProject(editingProjectId, { name: editingName.trim() });
      setProjects((prev) => prev.map((p) => (p.id === editingProjectId ? { ...p, name: editingName.trim() } : p)));
      setEditingProjectId(null);
    } catch (err) {
      alert(err.message || 'Failed to update project');
    }
  }, [editingProjectId, editingName]);

  const cancelEdit = useCallback(() => {
    setEditingProjectId(null);
    setEditingName('');
  }, []);

  const handleDelete = useCallback(async (p) => {
    if (!window.confirm(`Delete project "${p.name}"? All files, annotations, and settings will be removed.`)) return;
    setDeletingId(p.id);
    try {
      await api.deleteProject(p.id);
      setProjects((prev) => {
        const next = prev.filter((x) => x.id !== p.id);
        if (selectedProjectId === p.id) setSelectedProjectId(next[0]?.id ?? '');
        return next;
      });
    } catch (err) {
      alert(err.message || 'Failed to delete project');
    } finally {
      setDeletingId(null);
    }
  }, [selectedProjectId]);

  const otherViewers = viewers.filter((v) => v.userId !== user?.email);

  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  if (!user) return null;

  return (
    <div className="flex flex-1 min-h-0 bg-slate-100" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Mobile sidebar overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity duration-200"
        style={{ opacity: sidebarOpen ? 1 : 0, pointerEvents: sidebarOpen ? 'auto' : 'none' }}
        aria-hidden
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[min(100vw,360px)] lg:w-80 flex-shrink-0 flex flex-col bg-white border-r border-slate-200/80 shadow-xl lg:shadow-none transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50/80 lg:bg-white">
          <h1 className="text-sm font-semibold text-slate-800">Project panel</h1>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            aria-label="Close panel"
          >
            <span className="sr-only">Close</span>
            <span aria-hidden>✕</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 border border-primary-200/60 p-4">
            <p className="text-xs font-semibold text-primary-800 mb-1">How it works</p>
            <p className="text-xs text-primary-700/90 leading-relaxed">
              Create a project, upload models (OBJ, FBX, PLY, etc.). The 3D viewer is streamed by <strong>SignallingWebServer</strong>—run it so the viewer loads.
            </p>
          </div>

          <CollapsibleSection title="Projects" icon="📁" defaultOpen={true}>
            <div className="pt-3 space-y-3">
              {loading ? (
                <p className="text-sm text-slate-500">Loading…</p>
              ) : (
                <>
                  <form onSubmit={handleCreateProject} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="New project name"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="flex-1 min-w-0 rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={creating}
                      className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60 transition-colors shrink-0"
                    >
                      {creating ? '…' : 'Create'}
                    </button>
                  </form>
                  {projects.length === 0 ? (
                    <p className="text-sm text-slate-500">No projects yet. Create one above.</p>
                  ) : (
                    <ul className="space-y-1">
                      {projects.map((p) => (
                        <ProjectRow
                          key={p.id}
                          project={p}
                          isSelected={selectedProjectId === p.id}
                          isEditing={editingProjectId === p.id}
                          editingName={editingName}
                          onEditingNameChange={setEditingName}
                          onSelect={setSelectedProjectId}
                          onStartEdit={startEdit}
                          onSaveEdit={saveEdit}
                          onCancelEdit={cancelEdit}
                          onDelete={handleDelete}
                          isDeleting={deletingId === p.id}
                        />
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </CollapsibleSection>

          {selectedProjectId && (
            <>
              <CollapsibleSection title="Upload model" icon="⬆️" defaultOpen={true}>
                <div className="pt-3">
                  <FileUpload
                    projectId={selectedProjectId}
                    onUpload={api.uploadFile}
                    onSuccess={(res) => res.jobId && setLastJobId(res.jobId)}
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Processing status" icon="⏳" defaultOpen={false}>
                <div className="pt-3">
                  <ProcessingStatus getStatus={api.getProcessingStatus} initialJobId={lastJobId} />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Measure" icon="📐" defaultOpen={false}>
                <div className="pt-3">
                  <MeasurePanel
                    projectId={selectedProjectId}
                    viewerClickPosition={viewerClickPosition}
                    onViewerClickConsumed={() => setViewerClickPosition(null)}
                    sendToViewer={sendToViewer}
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Annotations" icon="💬" defaultOpen={false}>
                <div className="pt-3">
                  <AnnotationsPanel projectId={selectedProjectId} onFocusAnnotation={sendAnnotationFocus} remoteFocus={remoteAnnotationFocus} />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Share" icon="👥" defaultOpen={false}>
                <div className="pt-3">
                  <SharePanel projectId={selectedProjectId} />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Scene config" icon="🎬" defaultOpen={false}>
                <div className="pt-3">
                  <SceneConfigPanel projectId={selectedProjectId} />
                </div>
              </CollapsibleSection>

              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href={api.getReportPdfUrl(selectedProjectId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span aria-hidden>📄</span> Download report
                </a>
                <Link
                  to="/compare"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-300 bg-primary-50 px-4 py-2.5 text-sm font-medium text-primary-700 hover:bg-primary-100 transition-colors"
                >
                  Compare projects →
                </Link>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main: full-screen streaming viewer (sidebar is left panel only) */}
      <main className="flex-1 min-w-0 min-h-0 flex flex-col bg-slate-900 w-full">
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-800/90 border-b border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            aria-label="Open project panel"
          >
            <span className="text-lg" aria-hidden>☰</span>
          </button>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            {otherViewers.length > 0 && (
              <span className="text-xs text-slate-400 truncate">
                <span className="text-slate-500">Also viewing:</span>{' '}
                {otherViewers.map((v) => v.userName || v.userId).join(', ')}
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
          <PixelStreamViewer ref={viewerFrameRef} />
        </div>
      </main>
    </div>
  );
}

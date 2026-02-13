import { useState } from 'react';
import { ACCEPT_EXTENSIONS, FORMAT_HINT } from '../constants/supportedFormats';

export default function FileUpload({ projectId: projectIdProp, onUpload, onSuccess }) {
  const [projectIdInput, setProjectIdInput] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const projectId = projectIdProp ?? projectIdInput;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !projectId) return;
    setError(null);
    setUploading(true);
    try {
      const res = await onUpload(projectId, file);
      setFile(null);
      try {
        onSuccess?.(res);
      } catch (_) {
        // Don't set upload error if only onSuccess callback threw
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!projectIdProp && (
        <input
          type="text"
          placeholder="Project ID"
          value={projectIdInput}
          onChange={(e) => setProjectIdInput(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none"
        />
      )}
      <label className="block">
        <span className="sr-only">Choose file</span>
        <input
          type="file"
          accept={ACCEPT_EXTENSIONS}
          onChange={(e) => { setFile(e.target.files?.[0] ?? null); setError(null); }}
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-primary-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-200 file:transition-colors cursor-pointer"
        />
      </label>
      <p className="text-xs text-slate-500">{FORMAT_HINT}</p>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      <button
        type="submit"
        disabled={uploading || !file || !projectId}
        className="w-full rounded-lg bg-primary-600 px-3 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? 'Uploading…' : 'Upload'}
      </button>
    </form>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { DEFAULT_USER_ID } from '../config';

export default function Integrations() {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [webhook, setWebhook] = useState('');
  const [webhookInput, setWebhookInput] = useState('');
  const [loading, setLoading] = useState(true);

  const userId = user?.email || DEFAULT_USER_ID;

  useEffect(() => {
    Promise.all([api.getApiKey(userId), api.getWebhook(userId)])
      .then(([k, w]) => {
        setApiKey(k.apiKey || '');
        setWebhook(w?.url || '');
        setWebhookInput(w?.url || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSaveWebhook = async (e) => {
    e.preventDefault();
    try {
      await api.setWebhook(userId, webhookInput.trim() || null);
      setWebhook(webhookInput.trim() || '');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p className="p-8 text-gray-500">Loading…</p>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Integrations</h1>
      <p className="text-sm text-gray-600 mb-8">
        Connect external apps (RealityCapture, Metashape, Revit, etc.) via API key or webhooks.
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">API Key</h2>
        <p className="text-sm text-gray-500 mb-2">Use this key to authenticate requests from external applications.</p>
        <div className="flex gap-2 items-center">
          <code className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-sm font-mono break-all">{apiKey || '—'}</code>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText(apiKey)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            Copy
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Example: Authorization: Bearer YOUR_API_KEY</p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Webhook URL</h2>
        <p className="text-sm text-gray-500 mb-2">We will POST to this URL when processing completes (e.g. for pipeline integrations).</p>
        <form onSubmit={handleSaveWebhook} className="flex gap-2">
          <input
            type="url"
            placeholder="https://your-app.com/webhook"
            value={webhookInput}
            onChange={(e) => setWebhookInput(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
            Save
          </button>
        </form>
        {webhook && <p className="text-xs text-green-600 mt-2">Saved: {webhook}</p>}
      </section>

      <div className="mt-12 p-4 rounded-lg bg-primary-50 border border-primary-200 text-sm text-primary-800">
        <strong>Direct app integrations:</strong> Export from RealityCapture, Metashape, DJI Terra, etc. to OBJ/FBX/LAS and upload here. Webhook can notify your pipeline when processing is done.
      </div>
    </div>
  );
}

import { forwardRef, useState, useCallback } from 'react';

import { PIXEL_STREAM_URL as STREAM_URL } from '../config';

/**
 * Embeds the Pixel Streaming player (PixelStreamingInfrastructure UI) in this app.
 * Set VITE_PIXEL_STREAM_URL in .env to the URL where the SignallingWebServer serves the player.
 * Optional ref is forwarded to the iframe for postMessage (e.g. measure mode).
 * Mobile/performance: "Low quality" sends setQuality to viewer for LOD/reduced bitrate (UE must handle).
 */

const PixelStreamViewer = forwardRef(function PixelStreamViewer({ onSendToViewer }, ref) {
  const [lowQuality, setLowQuality] = useState(false);

  const send = useCallback((msg) => {
    try {
      ref?.current?.contentWindow?.postMessage(msg, '*');
    } catch (_) {}
    onSendToViewer?.(msg);
  }, [ref, onSendToViewer]);

  const toggleQuality = useCallback(() => {
    const next = !lowQuality;
    setLowQuality(next);
    send({ type: 'setQuality', quality: next ? 'low' : 'high' });
  }, [lowQuality, send]);

  if (!STREAM_URL) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-900">
        <p className="text-lg font-medium text-slate-300">3D viewer (SignallingWebServer) not connected</p>
        <p className="mt-2 text-sm max-w-md text-slate-400">
          The viewer is powered by <strong className="text-slate-300">SignallingWebServer</strong>. Run it, then set{' '}
          <code className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">VITE_PIXEL_STREAM_URL</code> in{' '}
          <code className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">.env</code> to the player URL.
        </p>
        <p className="mt-4 text-xs text-slate-500 max-w-md">
          Example: <code className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">./SignallingWebServer/platform_scripts/bash/start.sh</code>
        </p>
      </div>
    );
  }

  return (
      <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden touch-manipulation" style={{ touchAction: 'manipulation' }}>
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-800/80 border-b border-slate-700 shrink-0 flex-wrap">
        <span className="text-xs text-slate-400">
          3D stream · <strong className="text-slate-300">SignallingWebServer</strong>
          {STREAM_URL && (
            <span className="ml-1 text-amber-400/90" title="SignallingWebServer only listens for a streamer. Start the Unreal Engine Pixel Streaming app so it connects to port 8888. Run ./scripts/print-streamer-commands.sh for the exact command.">
              Streamer not available? Start the <strong>Unreal Engine</strong> app (separate process). Run: <code className="text-amber-300">./scripts/print-streamer-commands.sh</code>
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={toggleQuality}
          className={`text-xs px-2 py-1 rounded ${lowQuality ? 'bg-amber-600/80 text-white' : 'bg-slate-700 text-slate-300'} hover:opacity-90`}
          title="Use low quality (LOD) on mobile or slow connections"
        >
          {lowQuality ? 'Low quality' : 'Performance mode'}
        </button>
      </div>
      <iframe
        ref={ref}
        title="Pixel Streaming player"
        src={STREAM_URL}
        className="flex-1 w-full min-h-0 border-0 bg-black block"
        style={{ minHeight: '100%' }}
        allow="autoplay; fullscreen; xr-spatial-tracking; xr"
        allowFullScreen
      />
    </div>
  );
});

export default PixelStreamViewer;

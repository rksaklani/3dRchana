import { useEffect, useRef, useCallback, useState } from 'react';
import { API_BASE } from '../config';

function getWsUrl() {
  return API_BASE.replace(/^http/, 'ws') + '/collab';
}

export function useCollab(projectId, { viewerRef, user } = {}) {
  const wsRef = useRef(null);
  const [remoteCamera, setRemoteCamera] = useState(null);
  const [remoteAnnotationFocus, setRemoteAnnotationFocus] = useState(null);

  const send = useCallback((msg) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const sendCamera = useCallback((payload) => {
    send({ type: 'camera', payload });
  }, [send]);

  const sendAnnotationFocus = useCallback((annotationId) => {
    send({ type: 'annotationFocus', annotationId });
  }, [send]);

  useEffect(() => {
    if (!projectId || !user?.email) return;
    const url = getWsUrl();
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'join',
        projectId,
        userId: user.email,
        userName: user.name || user.email,
      }));
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'camera') {
          setRemoteCamera(msg);
          if (viewerRef?.current?.contentWindow) {
            viewerRef.current.contentWindow.postMessage({
              type: 'setCamera',
              position: msg.position,
              rotation: msg.rotation,
            }, '*');
          }
        } else if (msg.type === 'annotationFocus') {
          setRemoteAnnotationFocus({ userId: msg.userId, userName: msg.userName, annotationId: msg.annotationId });
        } else if (msg.type === 'userJoined' || msg.type === 'userLeft') {
          setRemoteAnnotationFocus((prev) => prev);
        }
      } catch (_) {}
    };

    ws.onclose = () => { wsRef.current = null; };
    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [projectId, user?.email, user?.name]);

  return { sendCamera, sendAnnotationFocus, remoteCamera, remoteAnnotationFocus };
}

'use client';
import { useEffect, useState } from 'react';
import { removePushSubscription, savePushSubscription, sendTestAlert } from '@/lib/actions/push';

type Status = 'checking' | 'unsupported' | 'needs-install' | 'denied' | 'off' | 'on';

const toKey = (base64Url: string) => {
  const padded = base64Url.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(base64Url.length / 4) * 4, '=');
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};

/** Phone alerts on/off for THIS phone or browser. Each phone is switched on separately. */
export default function PushAlerts({ publicKey, available }: { publicKey: string; available: boolean }) {
  const [status, setStatus] = useState<Status>('checking');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [detail, setDetail] = useState('');

  useEffect(() => {
    (async () => {
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const installed = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
      setDetail(`${ios ? 'iPhone/iPad' : 'other device'}; opened as installed app: ${installed ? 'yes' : 'no'}; alerts supported by this browser: ${'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window ? 'yes' : 'no'}; permission: ${'Notification' in window ? Notification.permission : 'n/a'}`);
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        setStatus(ios && !installed ? 'needs-install' : 'unsupported');
        return;
      }
      if (ios && !installed) return setStatus('needs-install');
      if (Notification.permission === 'denied') return setStatus('denied');
      try {
        const reg = await navigator.serviceWorker.getRegistration('/');
        const sub = await reg?.pushManager.getSubscription();
        setStatus(sub && Notification.permission === 'granted' ? 'on' : 'off');
      } catch {
        setStatus('off');
      }
    })();
  }, []);

  const turnOn = async () => {
    setBusy(true); setError(''); setMessage('');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setStatus(permission === 'denied' ? 'denied' : 'off'); return; }
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      const sub = existing ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(publicKey) });
      const result = await savePushSubscription(sub.toJSON(), Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
      if (result.error) { setError(result.error); await sub.unsubscribe().catch(() => undefined); return; }
      setStatus('on');
      setMessage('Alerts are on for this phone. Press "Send a test alert" to check.');
    } catch {
      setError('Could not turn alerts on for this phone. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const turnOff = async () => {
    setBusy(true); setError(''); setMessage('');
    try {
      const reg = await navigator.serviceWorker.getRegistration('/');
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        const result = await removePushSubscription(sub.endpoint);
        if (result.error) { setError(result.error); return; }
        await sub.unsubscribe();
      }
      setStatus('off');
      setMessage('Alerts are off for this phone.');
    } catch {
      setError('Could not turn alerts off. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    setBusy(true); setError(''); setMessage('');
    try {
      const result = await sendTestAlert();
      if (result.error) setError(result.error); else setMessage(`Test alert sent. It should arrive in a few seconds. ${result.detail ?? ''}`);
    } catch {
      setError('The app could not reach the server. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!available) return <p className="muted">Phone alerts are not switched on for this app yet.</p>;
  return (
    <div className="push-alerts">
      {status === 'checking' && <p className="muted">Checking this phone…</p>}
      {status === 'unsupported' && <p className="guide-note">This browser cannot receive phone alerts. Try Chrome or Edge on Android, or Safari on iPhone with the app added to the Home Screen.</p>}
      {status === 'needs-install' && <p className="guide-note"><strong>On iPhone and iPad, add the app to your Home Screen first.</strong> In Safari press Share, then <strong>Add to Home Screen</strong>. Open the app from its icon and come back to this page to turn alerts on.</p>}
      {status === 'denied' && <p className="guide-note">Alerts are blocked for this phone. Allow notifications for Screen Time Control in your phone or browser settings, then reload this page.</p>}
      {status === 'off' && <button type="button" className="button" disabled={busy} onClick={turnOn}>{busy ? 'Turning on…' : 'Turn on alerts on this phone'}</button>}
      {status === 'on' && (
        <div className="row-actions">
          <button type="button" className="button" disabled={busy} onClick={test}>Send a test alert</button>
          <button type="button" disabled={busy} onClick={turnOff}>Turn off on this phone</button>
        </div>
      )}
      {detail && <p className="muted" style={{ fontSize: 12 }}>Phone check: {detail}</p>}
      {message && <p role="status">{message}</p>}
      {error && <p className="error" role="alert">{error}</p>}
    </div>
  );
}

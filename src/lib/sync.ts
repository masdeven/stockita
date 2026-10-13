// BroadcastChannel helper for simple cross-tab invalidation
const CHANNEL = 'stockita-sync';

export function broadcastUpdate(payload: any) {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(CHANNEL);
      channel.postMessage(payload);
      channel.close();
    } else if (typeof window !== 'undefined' && (window as any).localStorage) {
      // fallback: localStorage event
      localStorage.setItem(`__${CHANNEL}`, JSON.stringify({ payload, t: Date.now() }));
    }
  } catch (err) {
    // ignore
  }
}

export function onBroadcast(handler: (payload: any) => void) {
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (e) => handler(e.data);
    return () => channel.close();
  }

  const listener = (e: StorageEvent) => {
    if (e.key === `__${CHANNEL}` && e.newValue) {
      try {
        const obj = JSON.parse(e.newValue);
        handler(obj.payload);
      } catch (err) {}
    }
  };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}

// Simple client-side session window control (6 hours by default)

const KEY = 'gi_session_start';

export function startSession() {
  try {
    localStorage.setItem(KEY, String(Date.now()));
  } catch {}
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

export function getSessionStart() {
  try {
    const v = localStorage.getItem(KEY);
    return v ? parseInt(v, 10) : null;
  } catch {
    return null;
  }
}

export function isSessionExpired(maxHours = 6) {
  const start = getSessionStart();
  if (!start) return false; // if unknown, treat as not expired
  const elapsedMs = Date.now() - start;
  return elapsedMs > maxHours * 60 * 60 * 1000;
}


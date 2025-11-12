// Lightweight runtime debugging helpers for SeatingCanvas.

export function isSeatingDebug() {
  try {
    if (typeof window !== 'undefined') {
      if (window.__SEATING_DEBUG__) return true;
      const params = new URLSearchParams(window.location.search);
      if (params.has('debugSeating')) return true;
    }
  } catch {}
  try {
    return (localStorage.getItem('DEBUG_SEATING') === '1');
  } catch {
    return false;
  }
}

export function logSeating(label, payload) {
  if (!isSeatingDebug()) return;
  try {
    // Collapsed group for less noisy logs
    // eslint-disable-next-line no-console
    console.groupCollapsed(`%c[SeatingDebug]%c ${label}`, 'color:#673ab7;font-weight:bold;', 'color:inherit;');
    // eslint-disable-next-line no-console
    console.log(payload);
    // eslint-disable-next-line no-console
    console.groupEnd();
  } catch {}
}

export function findDuplicatesById(list = []) {
  const counts = new Map();
  const dups = new Set();
  for (const g of list) {
    const k = g && g.id != null ? String(g.id) : undefined;
    if (k == null) continue;
    counts.set(k, (counts.get(k) || 0) + 1);
    if ((counts.get(k) || 0) > 1) dups.add(k);
  }
  return Array.from(dups);
}

export function summarizeIds(list = []) {
  return list.map(g => ({
    id: g?.id,
    idType: typeof g?.id,
    originalGuestId: g?.originalGuestId,
    originalGuestIdType: typeof g?.originalGuestId,
    name: `${g?.firstName || ''} ${g?.lastName || ''}`.trim(),
  }));
}

// Utility helpers for guest list operations

/**
 * Remove duplicate guests by id while preserving the first occurrence order.
 * @param {Array<{id: string|number}>} guests
 * @returns {Array}
 */
export function dedupeGuests(guests = []) {
  const seen = new Set();
  const result = [];
  for (const g of guests) {
    const rawId = g && g.id;
    const key = rawId == null ? undefined : String(rawId);
    if (key == null) {
      // If no id, include as-is (rare) but avoid crashing
      result.push(g);
      continue;
    }
    if (!seen.has(key)) {
      seen.add(key);
      result.push(g);
    }
  }
  return result;
}

/**
 * Append guests to an existing list ensuring uniqueness by id.
 * @param {Array} current
 * @param {Array|Object} toAdd array of guests or single guest
 * @returns {Array}
 */
export function addGuestsUnique(current = [], toAdd) {
  const addArray = Array.isArray(toAdd) ? toAdd : [toAdd];
  // Fast path: if nothing to add
  if (addArray.length === 0) return current;
  return dedupeGuests([...current, ...addArray]);
}

// --- New ID normalization helpers ---

/**
 * Generate a unique opaque guest id (GUID/UUID). Uses crypto.randomUUID when available,
 * otherwise falls back to RFC4122-ish random implementation. Ensures uniqueness vs existingIds.
 * @param {Set<string>} existingIds
 */
export function generateUniqueGuestId(existingIds) {
  const hasCrypto = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function';
  let id;
  do {
    id = hasCrypto ? crypto.randomUUID() : fallbackUuid();
  } while (existingIds.has(id));
  return id;
}

function fallbackUuid() {
  // Adapted lightweight UUID v4 fallback (no dashes to keep IDs concise)
  const template = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx';
  return template.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Normalize guest ids across guestList and tables, regenerating ids for duplicates.
 * Returns a new structure with remapped ids applied consistently.
 * @param {Array} guestList
 * @param {Array<Array>} tables
 */
export function normalizeGuestData(guestList = [], tables = []) {
  const seen = new Set();
  const remap = new Map(); // oldId -> newId
  const normalizedGuestList = guestList.map(g => {
    if (!g || g.id == null) return g; // leave as-is
    const key = String(g.id);
    if (seen.has(key)) {
      const newId = generateUniqueGuestId(seen);
      remap.set(g.id, newId);
      seen.add(newId);
      return { ...g, id: newId };
    } else {
      seen.add(key);
      return g;
    }
  });
  const normalizedTables = tables.map(table => {
    if (!Array.isArray(table)) return table;
    return table.map(g => {
      if (!g || g.id == null) return g;
      if (remap.has(g.id)) {
        return { ...g, id: remap.get(g.id) };
      }
      return g;
    });
  });
  return { guestList: normalizedGuestList, tables: normalizedTables, remap };
}

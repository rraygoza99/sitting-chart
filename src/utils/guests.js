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
    const key = g && g.id;
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

/**
 * Utility functions for safely handling product data and formatting.
 */

/**
 * Normalizes and formats product specifications into an array of { key, value } objects.
 * Handles:
 * - Mongoose array of objects: [{ key: 'Battery', value: '5000mAh' }] or [{ name: '...', value: '...' }]
 * - Standard key-value object: { Battery: '5000mAh' }
 * - Array of primitive strings/numbers
 * - Null, undefined, or empty values
 *
 * @param {any} specs - The raw specifications from the product document or API
 * @returns {Array<{ key: string, value: string }>}
 */
export function formatSpecifications(specs) {
  if (!specs) return [];

  if (Array.isArray(specs)) {
    return specs
      .map((item, idx) => {
        if (!item) return null;
        if (typeof item === 'object') {
          // Check standard Mongoose schema fields: key / value
          const key = item.key || item.name || item.title || item.label || `Specification ${idx + 1}`;
          let val = item.value ?? item.val ?? '';
          if (typeof val === 'object' && val !== null) {
            val = JSON.stringify(val);
          } else {
            val = String(val);
          }
          return { key: String(key), value: val };
        }
        return { key: `Specification ${idx + 1}`, value: String(item) };
      })
      .filter(item => item && item.key && item.value);
  }

  if (typeof specs === 'object') {
    return Object.entries(specs)
      .map(([k, v]) => {
        let val = v;
        if (typeof v === 'object' && v !== null) {
          val = v.value ?? v.val ?? JSON.stringify(v);
        }
        return { key: String(k), value: String(val ?? '') };
      })
      .filter(item => item && item.key && item.value);
  }

  return [];
}

/**
 * Parses URL query parameters for product IDs, supporting:
 * - Repeated keys: ?id=abc&id=def
 * - Comma-separated: ?id=abc,def
 * - Whitespace trimming and deduplication
 *
 * @param {URLSearchParams} searchParams
 * @param {number} max
 * @returns {string[]}
 */
export function parseComparisonIds(searchParams, max = 4) {
  if (!searchParams) return [];
  const rawIds = searchParams.getAll('id');
  const allIds = rawIds
    .flatMap(id => (typeof id === 'string' ? id.split(',') : []))
    .map(id => id.trim())
    .filter(id => Boolean(id) && id.length > 0);

  // Return unique IDs up to max
  return Array.from(new Set(allIds)).slice(0, max);
}

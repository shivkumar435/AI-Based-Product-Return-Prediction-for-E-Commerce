/**
 * Automated Verification: Product Comparison & Specification Normalization Logic
 * Verifies that:
 * 1. Mongoose array-of-objects specifications are cleanly converted to { key, value } strings.
 * 2. Key-value specification maps are converted to { key, value } strings.
 * 3. Primitive arrays and edge cases are handled safely.
 * 4. Value is NEVER a raw JavaScript object (preventing React child crashes).
 * 5. URL query parameters with comma-separated, repeated, or whitespace IDs are parsed safely.
 */

const assert = require('assert');

// Import or replicate the formatSpecifications and parseComparisonIds logic
function formatSpecifications(specs) {
  if (!specs) return [];

  if (Array.isArray(specs)) {
    return specs
      .map((item, idx) => {
        if (!item) return null;
        if (typeof item === 'object') {
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

function parseComparisonIds(rawIds, max = 4) {
  if (!rawIds) return [];
  const list = Array.isArray(rawIds) ? rawIds : [rawIds];
  const allIds = list
    .flatMap(id => (typeof id === 'string' ? id.split(',') : []))
    .map(id => id.trim())
    .filter(id => Boolean(id) && id.length > 0);

  return Array.from(new Set(allIds)).slice(0, max);
}

function runTests() {
  console.log('--- TEST 1: Mongoose Schema Format ([{ key, value }]) ---');
  const mongooseSpecs = [
    { key: 'Display', value: '6.7 inch AMOLED' },
    { key: 'Battery', value: '5000 mAh' },
    { key: 'RAM', value: '12 GB' }
  ];

  const res1 = formatSpecifications(mongooseSpecs);
  assert.strictEqual(res1.length, 3);
  assert.strictEqual(res1[0].key, 'Display');
  assert.strictEqual(res1[0].value, '6.7 inch AMOLED');
  // CRITICAL: Ensure none of the values are raw objects
  res1.forEach(spec => {
    assert.strictEqual(typeof spec.value, 'string', 'Spec value must be a primitive string, never an object');
  });
  console.log('✔ Mongoose [{ key, value }] specifications cleanly formatted without raw objects.');

  console.log('\n--- TEST 2: Key-Value Map Format ({ Key: Value }) ---');
  const objectSpecs = {
    Brand: 'Apple',
    Processor: 'M2 Ultra',
    Storage: '1 TB SSD'
  };

  const res2 = formatSpecifications(objectSpecs);
  assert.strictEqual(res2.length, 3);
  assert.strictEqual(res2[0].key, 'Brand');
  assert.strictEqual(res2[0].value, 'Apple');
  res2.forEach(spec => {
    assert.strictEqual(typeof spec.value, 'string', 'Spec value must be a primitive string');
  });
  console.log('✔ Key-value object specifications cleanly converted.');

  console.log('\n--- TEST 3: Defensive Handling of Malformed / Nested Specs ---');
  const malformedSpecs = [
    { key: 'Complex', value: { nestedKey: 'nestedVal' } },
    null,
    undefined,
    'Bare String Spec'
  ];

  const res3 = formatSpecifications(malformedSpecs);
  assert.strictEqual(res3.length, 2);
  assert.strictEqual(res3[0].key, 'Complex');
  assert.strictEqual(typeof res3[0].value, 'string');
  assert.strictEqual(res3[0].value, '{"nestedKey":"nestedVal"}');
  assert.strictEqual(res3[1].key, 'Specification 4');
  assert.strictEqual(res3[1].value, 'Bare String Spec');
  console.log('✔ Malformed, nested, and primitive specs safely sanitized.');

  console.log('\n--- TEST 4: Null, Undefined, and Empty Cases ---');
  assert.deepStrictEqual(formatSpecifications(null), []);
  assert.deepStrictEqual(formatSpecifications(undefined), []);
  assert.deepStrictEqual(formatSpecifications([]), []);
  assert.deepStrictEqual(formatSpecifications({}), []);
  console.log('✔ Empty and null specs safely return empty array.');

  console.log('\n--- TEST 5: Comparison Query ID Parsing ---');
  // Comma-separated: ?id=A,B,C
  const ids1 = parseComparisonIds(['6ad2746c5478be47e957b0df,6ad2746c5478be47e957b0e0']);
  assert.deepStrictEqual(ids1, ['6ad2746c5478be47e957b0df', '6ad2746c5478be47e957b0e0']);

  // Repeated: ?id=A&id=B
  const ids2 = parseComparisonIds(['6ad2746c5478be47e957b0df', '6ad2746c5478be47e957b0e0']);
  assert.deepStrictEqual(ids2, ['6ad2746c5478be47e957b0df', '6ad2746c5478be47e957b0e0']);

  // Mixed, duplicate, and whitespace
  const ids3 = parseComparisonIds([
    '  6ad2746c5478be47e957b0df  ',
    '6ad2746c5478be47e957b0e0, 6ad2746c5478be47e957b0df',
    '6ad2746c5478be47e957b0e1'
  ]);
  assert.deepStrictEqual(ids3, [
    '6ad2746c5478be47e957b0df',
    '6ad2746c5478be47e957b0e0',
    '6ad2746c5478be47e957b0e1'
  ]);

  // Capped at max 4
  const ids4 = parseComparisonIds(['1,2,3,4,5,6,7'], 4);
  assert.strictEqual(ids4.length, 4);
  assert.deepStrictEqual(ids4, ['1', '2', '3', '4']);
  console.log('✔ Comma-separated, repeated, deduplicated, and capped IDs parsed cleanly.');

  console.log('\n--- ALL COMPARISON LOGIC TESTS PASSED SUCCESSFULLY ---');
}

runTests();

/**
 * Auto SKU format: WIDGET-001, WIDGET-002, …
 */
const SKU_PREFIX = 'WIDGET-';
const SKU_REGEX = /^WIDGET-(\d+)$/i;

function formatSku(seq) {
  const n = Math.max(1, Math.floor(Number(seq) || 0));
  return `${SKU_PREFIX}${String(n).padStart(3, '0')}`;
}

function maxWidgetNumberFromSkus(skus) {
  let maxN = 0;
  for (const s of skus) {
    const m = SKU_REGEX.exec(String(s || '').trim());
    if (m) maxN = Math.max(maxN, parseInt(m[1], 10));
  }
  return maxN;
}

module.exports = { SKU_PREFIX, SKU_REGEX, formatSku, maxWidgetNumberFromSkus };

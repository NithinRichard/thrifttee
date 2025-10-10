/*
  Sizing Guide Utilities
  - Normalize historical/international sizes (vintage, UK, EU) to standard US
  - Estimate size from garment measurements (pit-to-pit, shoulder, length)
  - Provide user-facing guidance strings for PDP

  Usage:
    import { normalizeSize, estimateFromMeasurements, formatSizingAdvice } from '../utils/sizing';

    const normalized = normalizeSize({ label: product.size, gender: product.gender, era: product.tags, brand: product.brand?.name });
    const estimate = estimateFromMeasurements({
      pitToPit: product.pit_to_pit,
      shoulderToShoulder: product.shoulder_to_shoulder,
      frontLength: product.front_length,
      sleeveLength: product.sleeve_length,
      gender: product.gender,
    });
*/

const BASE_US_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

// Baseline brand fit adjustments (some brands run larger/smaller)
// Values shift size index by +1 (larger) or -1 (smaller)
const BRAND_ADJUSTMENTS = {
  // Examples; expand over time based on returns/feedback data
  'Levi': 0,
  'Nike': 0,
  'Adidas': -0.5, // may run slightly large in vintage cuts
  'Champion': +0.5, // vintage reverse weave often runs smaller in label
};

// Era adjustments (vintage tends to run small relative to contemporary)
const ERA_ADJUSTMENTS = {
  vintage: +0.5, // nudge up half size for vintage-era labels
  '80s': +0.5,
  '90s': +0.5,
  '70s': +0.5,
};

// Region conversions to US
// Reference tables can be refined over time; keep simple for initial release
const REGION_TO_US = {
  EU: {
    // EU numeric tops approx mapping to unisex US alpha sizes
    // values are US sizes
    '44': 'XS', '46': 'S', '48': 'M', '50': 'L', '52': 'XL', '54': 'XXL', '56': 'XXXL',
  },
  UK: {
    // Often UK alpha labels match US alpha labels for tops
    'XS': 'XS', 'S': 'S', 'M': 'M', 'L': 'L', 'XL': 'XL', 'XXL': 'XXL', 'XXXL': 'XXXL',
  },
};

// Normalize textual labels (e.g., 'medium', 'M', 'm', 'Large', 'L/G') to US alpha sizes
const TEXT_TO_US = {
  'xs': 'XS', 'x-small': 'XS', 'extra small': 'XS',
  's': 'S', 'small': 'S',
  'm': 'M', 'medium': 'M',
  'l': 'L', 'large': 'L',
  'xl': 'XL', 'x-large': 'XL', 'extra large': 'XL',
  'xxl': 'XXL', '2xl': 'XXL',
  'xxxl': 'XXXL', '3xl': 'XXXL',
};

// Heuristics to pick size index from label
function sizeIndexFromUS(us) {
  return Math.max(0, BASE_US_SIZES.indexOf(us));
}

function clampSizeIndex(idx) {
  if (idx < 0) return 0;
  if (idx >= BASE_US_SIZES.length) return BASE_US_SIZES.length - 1;
  return idx;
}

function inferRegionFromLabel(label = '') {
  const s = String(label).trim();
  // If numeric (e.g., 48, 50) assume EU
  if (/^\d{2}$/.test(s)) return 'EU';
  // If has UK markers, assume UK
  if (/\bUK\b/i.test(s)) return 'UK';
  return null;
}

function normalizeTextSize(label = '') {
  const key = String(label).toLowerCase().replace(/[^a-z0-9]/g, '');
  return TEXT_TO_US[key] || null;
}

function convertRegionToUS(label = '', region) {
  const key = String(label).toUpperCase();
  const map = REGION_TO_US[region];
  if (!map) return null;
  if (map[key]) return map[key];
  // EU numeric like 48/50 sometimes formatted with slash; pick first
  const numeric = key.split('/')[0];
  return map[numeric] || null;
}

// Estimate US size from garment measurements; pit-to-pit is the strongest signal for tees
// These breakpoints are approximations and can be tuned with real data
function estimateFromMeasurements({ pitToPit, shoulderToShoulder, frontLength, sleeveLength, gender = 'unisex' } = {}) {
  const p2p = parseFloat(pitToPit);
  if (Number.isFinite(p2p)) {
    // Chest circumference approx 2 * pit-to-pit in inches
    const chest = p2p * 2;
    // Thresholds (inches) roughly for unisex/men tees
    // XS: < 34, S: 34-36, M: 38-40, L: 42-44, XL: 46-48, XXL: 50-52
    if (chest < 34) return 'XS';
    if (chest < 38) return 'S';
    if (chest < 42) return 'M';
    if (chest < 46) return 'L';
    if (chest < 50) return 'XL';
    if (chest < 54) return 'XXL';
    return 'XXXL';
  }
  // Fallback using shoulder width
  const shoulder = parseFloat(shoulderToShoulder);
  if (Number.isFinite(shoulder)) {
    if (shoulder < 16) return 'XS';
    if (shoulder < 17.5) return 'S';
    if (shoulder < 19) return 'M';
    if (shoulder < 20.5) return 'L';
    if (shoulder < 22) return 'XL';
    if (shoulder < 23.5) return 'XXL';
    return 'XXXL';
  }
  return null;
}

export function normalizeSize({ label, gender = 'unisex', era, brand } = {}) {
  const notes = [];
  let us = null;

  // 1) Direct alpha normalization (S/M/L)
  us = normalizeTextSize(label);

  // 2) Region conversion (EU/UK)
  if (!us) {
    const region = inferRegionFromLabel(label);
    if (region) {
      const converted = convertRegionToUS(label, region);
      if (converted) {
        us = converted;
        notes.push(`${region} to US conversion applied`);
      }
    }
  }

  // 3) Try to parse numeric with a hint (e.g., EU size provided in metadata)
  if (!us && /^\d{2}$/.test(String(label || ''))) {
    const converted = convertRegionToUS(label, 'EU');
    if (converted) {
      us = converted;
      notes.push('EU to US conversion applied');
    }
  }

  // 4) If still unknown, return null (UI can suggest using measurements)
  if (!us) {
    return { us: null, suggested: null, notes: ['Size label could not be normalized. Use measurements for best fit.'] };
  }

  // Apply brand/era nudges to final recommendation (± half size)
  let idx = sizeIndexFromUS(us);

  // Brand adjustment
  if (brand && BRAND_ADJUSTMENTS[brand]) {
    idx += BRAND_ADJUSTMENTS[brand];
    notes.push(`Brand fit adjustment (${BRAND_ADJUSTMENTS[brand] > 0 ? '+' : ''}${BRAND_ADJUSTMENTS[brand]} size)`);
  }

  // Era adjustment
  const eraKey = (era || '').toString().toLowerCase();
  Object.keys(ERA_ADJUSTMENTS).forEach(k => {
    if (eraKey.includes(k)) {
      idx += ERA_ADJUSTMENTS[k];
      notes.push(`Vintage era adjustment (+${ERA_ADJUSTMENTS[k]} size)`);
    }
  });

  // Round half steps to nearest index
  idx = clampSizeIndex(Math.round(idx));

  const suggested = BASE_US_SIZES[idx];
  return { us, suggested, notes };
}

export function formatSizingAdvice({ normalized, measurementEstimate } = {}) {
  const lines = [];
  if (normalized?.us) {
    if (normalized.suggested && normalized.suggested !== normalized.us) {
      lines.push(`Label appears as ${normalized.us}. Suggested fit: ${normalized.suggested}.`);
    } else {
      lines.push(`Standardized size: ${normalized.us}.`);
    }
  } else {
    lines.push('Size label could not be normalized.');
  }

  if (measurementEstimate) {
    lines.push(`Estimated from measurements: ${measurementEstimate}.`);
  } else {
    lines.push('Use garment measurements (pit-to-pit, length) for best fit.');
  }

  if (normalized?.notes?.length) {
    lines.push(normalized.notes.join(' '));
  }

  return lines.join(' ');
}

export { estimateFromMeasurements };

// Rule-based natural language parser -> converts plain English to filter object
const countryMap = {
  nigeria: 'NG',
  kenya: 'KE',
  angola: 'AO',
  benin: 'BJ',
  "united states": 'US',
  usa: 'US',
  ghana: 'GH'
};

function parseNumberToken(tokens, idx) {
  const t = tokens[idx];
  const n = parseInt(t, 10);
  return Number.isNaN(n) ? null : n;
}

function parseNaturalLanguage(q) {
  if (!q || !q.trim()) return null;
  const text = q.toLowerCase();
  const tokens = text.split(/[^a-z0-9]+/).filter(Boolean);
  const filters = {};

  // gender
  if (tokens.includes('male')) filters.gender = 'male';
  if (tokens.includes('female')) filters.gender = 'female';

  // both genders -> ignore gender filter
  if (tokens.includes('male') && tokens.includes('female')) delete filters.gender;

  // age group words
  const groups = ['child', 'teenager', 'adult', 'senior'];
  for (const g of groups) if (tokens.includes(g)) { filters.age_group = g; break; }

  // special word 'young' -> min_age 16 max_age 24
  if (tokens.includes('young')) {
    filters.min_age = 16;
    filters.max_age = 24;
  }

  // look for patterns like 'above 30', 'over 30', 'greater 30' -> min_age
  tokens.forEach((t, i) => {
    if ((t === 'above' || t === 'over' || t === 'greater' || t === 'more') && tokens[i+1]) {
      const n = parseNumberToken(tokens, i+1);
      if (n !== null) filters.min_age = Math.max(filters.min_age || 0, n);
    }
    if ((t === 'below' || t === 'under' || t === 'less') && tokens[i+1]) {
      const n = parseNumberToken(tokens, i+1);
      if (n !== null) filters.max_age = Math.min(filters.max_age || 200, n);
    }
    // direct numbers after adjectives: 'above 30' handled; also '17' alone may influence min_age if prefixed by 'above' or 'over'
  });

  // explicit numbers: phrases like 'above 17' already handled; also '17' following 'teenagers' -> min_age 17
  tokens.forEach((t, i) => {
    const n = parseInt(t, 10);
    if (!Number.isNaN(n)) {
      // check nearby words
      const prev = tokens[i-1] || '';
      if (['above','over','more','greater'].includes(prev)) filters.min_age = Math.max(filters.min_age || 0, n);
      if (['below','under','less'].includes(prev)) filters.max_age = Math.min(filters.max_age || 200, n);
    }
  });

  // country detection by name
  Object.keys(countryMap).forEach(name => {
    if (text.includes(name)) filters.country_id = countryMap[name];
  });

  // If we didn't extract any meaningful filter, return null
  const meaningful = ['gender','age_group','min_age','max_age','country_id'];
  const hasMeaning = meaningful.some(k => Object.prototype.hasOwnProperty.call(filters, k));
  if (!hasMeaning) return null;

  return filters;
}

module.exports = { parseNaturalLanguage };

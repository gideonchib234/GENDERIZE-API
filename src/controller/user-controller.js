const Profile = require('../models/schema');
const { parseNaturalLanguage } = require('../utils/queryParser');

function buildFiltersFromQuery(q) {
  const filters = {};
  if (q.gender) filters.gender = q.gender;
  if (q.age_group) filters.age_group = q.age_group;
  if (q.country_id) filters.country_id = q.country_id.toUpperCase();
  if (q.min_age) filters.age = Object.assign({}, filters.age, { $gte: Number(q.min_age) });
  if (q.max_age) filters.age = Object.assign({}, filters.age, { $lte: Number(q.max_age) });
  if (q.min_gender_probability) filters.gender_probability = { $gte: Number(q.min_gender_probability) };
  if (q.min_country_probability) filters.country_probability = { $gte: Number(q.min_country_probability) };
  return filters;
}

function validatePagination(page, limit) {
  const p = Number(page || 1);
  const l = Number(limit || 10);
  if (!Number.isInteger(p) || p < 1) return { error: true, code: 422, message: 'Invalid page parameter' };
  if (!Number.isInteger(l) || l < 1 || l > 50) return { error: true, code: 422, message: 'Invalid limit parameter' };
  return { page: p, limit: l };
}

exports.getProfiles = async (req, res) => {
  try {
    const q = req.query;
    // validate types
    const allowedSortBy = ['age', 'created_at', 'gender_probability'];
    const allowedOrder = ['asc', 'desc'];

    if (q.sort_by && !allowedSortBy.includes(q.sort_by)) return res.status(422).json({ status: 'error', message: 'Invalid sort_by parameter' });
    if (q.order && !allowedOrder.includes(q.order)) return res.status(422).json({ status: 'error', message: 'Invalid order parameter' });

    const pag = validatePagination(q.page, q.limit);
    if (pag.error) return res.status(pag.code).json({ status: 'error', message: pag.message });

    const filters = buildFiltersFromQuery(q);

    const sortField = q.sort_by || 'created_at';
    const sortOrder = q.order === 'asc' ? 1 : -1;

    const total = await Profile.countDocuments(filters);
    const data = await Profile.find(filters)
      .sort({ [sortField]: sortOrder })
      .skip((pag.page - 1) * pag.limit)
      .limit(pag.limit)
      .lean();

    // format created_at as ISO utc
    const out = data.map(d => ({ ...d, created_at: new Date(d.created_at).toISOString() }));

    return res.json({ status: 'success', page: pag.page, limit: pag.limit, total, data: out });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

exports.searchProfiles = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) return res.status(400).json({ status: 'error', message: 'Missing or empty parameter' });

    const parsed = parseNaturalLanguage(q);
    if (!parsed) return res.status(422).json({ status: 'error', message: 'Unable to interpret query' });

    // merge parsed with other possible query params (pagination/sort)
    const fakeReqQuery = Object.assign({}, parsed, req.query);
    // reuse getProfiles logic by calling build and executing
    const pag = (function() {
      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 10);
      if (!Number.isInteger(page) || page < 1) return { error: true, code: 422, message: 'Invalid page parameter' };
      if (!Number.isInteger(limit) || limit < 1 || limit > 50) return { error: true, code: 422, message: 'Invalid limit parameter' };
      return { page, limit };
    })();
    if (pag.error) return res.status(pag.code).json({ status: 'error', message: pag.message });

    const filters = buildFiltersFromQuery(fakeReqQuery);

    const sortField = req.query.sort_by || 'created_at';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const total = await Profile.countDocuments(filters);
    const data = await Profile.find(filters)
      .sort({ [sortField]: sortOrder })
      .skip((pag.page - 1) * pag.limit)
      .limit(pag.limit)
      .lean();

    const out = data.map(d => ({ ...d, created_at: new Date(d.created_at).toISOString() }));
    return res.json({ status: 'success', page: pag.page, limit: pag.limit, total, data: out });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

exports.getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ status: 'error', message: 'Missing or empty parameter' });
    const profile = await Profile.findOne({ id }).lean();
    if (!profile) return res.status(404).json({ status: 'error', message: 'Profile not found' });
    profile.created_at = new Date(profile.created_at).toISOString();
    return res.json({ status: 'success', data: profile });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

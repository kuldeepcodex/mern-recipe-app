const router = require('express').Router();
const Recipe = require('../models/Recipe');
const { auth, optionalAuth } = require('../middleware/auth');

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Shape a recipe for the client (adds average rating, my rating, favorite flag)
function serialize(doc, userId) {
  const r = doc.toObject();
  const ratings = r.ratings || [];
  const favorites = r.favorites || [];
  const count = ratings.length;
  const avg = count ? ratings.reduce((sum, x) => sum + x.value, 0) / count : 0;
  const mine = userId ? ratings.find((x) => String(x.user) === String(userId)) : null;
  delete r.ratings;
  delete r.favorites;
  return {
    ...r,
    avgRating: Math.round(avg * 10) / 10,
    ratingCount: count,
    myRating: mine ? mine.value : 0,
    favoriteCount: favorites.length,
    isFavorite: userId ? favorites.some((f) => String(f) === String(userId)) : false,
  };
}

// Accept only known fields and normalise lists
function clean(body) {
  const lines = (v) =>
    (Array.isArray(v) ? v : String(v || '').split('\n')).map((s) => String(s).trim()).filter(Boolean);
  return {
    title: body.title,
    description: body.description,
    image: body.image,
    category: body.category,
    cookTime: body.cookTime,
    servings: body.servings,
    ingredients: lines(body.ingredients),
    steps: lines(body.steps),
  };
}

async function listRecipes(req, res, baseFilter = {}) {
  const { q, category, page = 1, limit = 12 } = req.query;
  const filter = { ...baseFilter };
  if (category && category !== 'All') filter.category = category;
  if (q && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ title: rx }, { ingredients: rx }, { description: rx }];
  }
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const [items, total] = await Promise.all([
    Recipe.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l).populate('author', 'name'),
    Recipe.countDocuments(filter),
  ]);
  const userId = req.user && req.user.id;
  res.json({ recipes: items.map((r) => serialize(r, userId)), total, page: p, pages: Math.ceil(total / l) || 1 });
}

router.get('/categories', (req, res) => res.json(Recipe.CATEGORIES));

router.get('/', optionalAuth, wrap((req, res) => listRecipes(req, res)));
router.get('/mine', auth, wrap((req, res) => listRecipes(req, res, { author: req.user.id })));
router.get('/favorites', auth, wrap((req, res) => listRecipes(req, res, { favorites: req.user.id })));

router.get(
  '/:id',
  optionalAuth,
  wrap(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'name');
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    res.json(serialize(recipe, req.user && req.user.id));
  })
);

router.post(
  '/',
  auth,
  wrap(async (req, res) => {
    const recipe = await Recipe.create({ ...clean(req.body), author: req.user.id });
    await recipe.populate('author', 'name');
    res.status(201).json(serialize(recipe, req.user.id));
  })
);

router.put(
  '/:id',
  auth,
  wrap(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    if (String(recipe.author) !== req.user.id) return res.status(403).json({ message: 'You can only edit your own recipes' });
    recipe.set(clean(req.body));
    await recipe.save();
    await recipe.populate('author', 'name');
    res.json(serialize(recipe, req.user.id));
  })
);

router.delete(
  '/:id',
  auth,
  wrap(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    if (String(recipe.author) !== req.user.id) return res.status(403).json({ message: 'You can only delete your own recipes' });
    await recipe.deleteOne();
    res.json({ message: 'Recipe deleted' });
  })
);

router.post(
  '/:id/rate',
  auth,
  wrap(async (req, res) => {
    const value = Number(req.body.value);
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5' });
    }
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    const existing = recipe.ratings.find((x) => String(x.user) === req.user.id);
    if (existing) existing.value = value;
    else recipe.ratings.push({ user: req.user.id, value });
    await recipe.save();
    await recipe.populate('author', 'name');
    res.json(serialize(recipe, req.user.id));
  })
);

router.post(
  '/:id/favorite',
  auth,
  wrap(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
    const i = recipe.favorites.findIndex((f) => String(f) === req.user.id);
    if (i >= 0) recipe.favorites.splice(i, 1);
    else recipe.favorites.push(req.user.id);
    await recipe.save();
    await recipe.populate('author', 'name');
    res.json(serialize(recipe, req.user.id));
  })
);

module.exports = router;

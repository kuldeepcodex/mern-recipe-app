const router = require('express').Router();
const User = require('../models/User');
const { auth, signToken } = require('../middleware/auth');

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email });

router.post(
  '/register',
  wrap(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email: String(email).toLowerCase() })) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    const user = await User.create({ name, email, password });
    res.status(201).json({ token: signToken(user._id), user: publicUser(user) });
  })
);

router.post(
  '/login',
  wrap(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ token: signToken(user._id), user: publicUser(user) });
  })
);

router.get(
  '/me',
  auth,
  wrap(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ user: publicUser(user) });
  })
);

module.exports = router;

const jwt = require('jsonwebtoken');

const secret = () => process.env.JWT_SECRET || 'dev-secret';

function readToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

// Requires a valid token
function auth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: 'Please log in' });
  try {
    req.user = { id: jwt.verify(token, secret()).id };
    next();
  } catch {
    res.status(401).json({ message: 'Session expired, please log in again' });
  }
}

// Attaches req.user if a valid token is present, otherwise continues anonymously
function optionalAuth(req, res, next) {
  const token = readToken(req);
  if (token) {
    try {
      req.user = { id: jwt.verify(token, secret()).id };
    } catch {
      /* ignore invalid token */
    }
  }
  next();
}

const signToken = (id) => jwt.sign({ id }, secret(), { expiresIn: '7d' });

module.exports = { auth, optionalAuth, signToken };

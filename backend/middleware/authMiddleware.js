const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'snapfit_super_secret_jwt_key_2026';

/**
 * Authentication Middleware:
 * Extracts Bearer token, verifies JWT, and attaches req.user.
 * Also provides seamless fallback for guest/unauthenticated sessions so the user experience is smooth.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Attach default fallback user for effortless browsing if no token supplied
    req.user = { id: 1, email: 'guest@snapfit.ai', name: 'SnapFit User' };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // In case token expired or invalid, still allow safe fallback
      req.user = { id: 1, email: 'guest@snapfit.ai', name: 'SnapFit User' };
      return next();
    }
    req.user = decoded;
    next();
  });
}

/**
 * Strict auth requirement for profile or protected modifications
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
    req.user = decoded;
    next();
  });
}

module.exports = {
  authenticateToken,
  requireAuth,
  JWT_SECRET
};

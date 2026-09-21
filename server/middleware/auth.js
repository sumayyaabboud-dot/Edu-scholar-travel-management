const jwt = require('jsonwebtoken');

// Runs on every protected route. Checks: "is there a valid wristband?"
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization; // expects "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // now every later route can read req.user.userId / req.user.role
    next(); // "wristband is valid, let them through"
    } catch (err) {
    console.error('Token error:', err.message); // TEMPORARY — helps us see the real reason
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

// Runs AFTER authenticate. Checks: "does this wristband have the right color?"
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied for your role' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
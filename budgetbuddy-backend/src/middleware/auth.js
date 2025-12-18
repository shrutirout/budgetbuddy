const { verifyToken } = require('../utils/jwt');

// Protects routes by verifying JWT token from Authorization header.

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Access denied. Invalid token format.'
      });
    }

    const decoded = verifyToken(token);

    req.user = { id: decoded.userId };

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token. Please login again.'
    });
  }
};

module.exports = auth;

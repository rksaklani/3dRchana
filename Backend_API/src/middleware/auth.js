const config = require('../config');
const integrationsStore = require('../services/integrationsStore');

async function authMiddleware(req, res, next) {
  const apiKey = req.headers['x-api-key'] || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') && req.headers.authorization.slice(7));
  if (apiKey) {
    const userId = await integrationsStore.getUserIdByApiKey(apiKey);
    if (userId) {
      req.userId = userId;
      return next();
    }
  }
  const headerUserId = req.headers['x-user-id'];
  if (headerUserId) {
    req.userId = headerUserId;
    return next();
  }
  req.userId = null;
  next();
}

function requireAuth(req, res, next) {
  if (!req.userId) return res.status(401).json({ error: config.AUTH_ERROR_REQUIRED_DETAIL });
  next();
}

module.exports = { authMiddleware, requireAuth };

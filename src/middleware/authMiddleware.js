function requireAuth(req, res, next) {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}

function attachPlayerToLocals(req, res, next) {
  res.locals.currentPlayer = req.user || null;
  next();
}

module.exports = {
  requireAuth,
  attachPlayerToLocals
};

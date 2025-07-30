function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  // OR: if you store user manually in req.user
  if (req.user) {
    return next();
  }

  res.redirect("/admin/login"); // or "/login" based on your login route
}

module.exports = { ensureAuthenticated };

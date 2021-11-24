const middlewares = {
  isLoggedIn: function (req, res, next) {
    if (req.user) return next();
    res.redirect("/");
  },
};
module.exports = middlewares;

const AppError = require("../utils/appError");

exports.getLoginPage = (req, res, next) => {
  res.status(200).render("login");
};

exports.getSignupPage = (req, res, next) => {
  res.status(200).render("signup");
};

exports.getSpacePage = (req, res, next) => {
  const spaceId = req.query.spaceId;
  res.status(200).render("space", { user: req.user, spaceId });
};

exports.getIndexPage = (req, res, next) => {
  const user = req.user;
  res.status(200).render("index", { user });
};

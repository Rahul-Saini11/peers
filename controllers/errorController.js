function handleDevError(err, req, res) {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      name: err.name,
      message: err.message,
      err: err.stack,
    });
  }
  res.status(500).render("error");
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENVIRONMENT === "DEVELOPMENT") {
    handleDevError(err, req, res);
  }
};

const notFoundHandler = (req, res, _next) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
}

const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500

  res.status(statusCode).json({
    message: err.message || 'Internal server error',
  })
}

module.exports = {
  notFoundHandler,
  errorHandler,
}

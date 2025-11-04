// Middleware: set requestPath on req and res.locals for templates
// Provides a consistent value templates can use to detect current path
module.exports = function requestPathMiddleware(req, res, next) {
  try {
    // prefer originalUrl when available to include query/path, but keep just pathname when needed
    const path = req.path || req.originalUrl || '';
    req.requestPath = path;
    res.locals.requestPath = path;
  } catch (e) {
    // do not block requests if something unexpected happens
    res.locals.requestPath = '';
    req.requestPath = '';
  }
  next();
};

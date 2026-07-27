// Wraps an async controller so any thrown error (or rejected promise)
// is forwarded to next(), which routes it straight to the global
// error middleware. Without this, every controller would need its
// own try/catch block.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

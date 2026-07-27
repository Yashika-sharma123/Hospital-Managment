const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Both are applied globally in server.js, right after express.json().
// mongoSanitize strips out keys starting with "$" or containing "."
// (which could otherwise be used for NoSQL injection, e.g. {"$gt": ""}).
// xss-clean strips out any <script> or HTML tags from req.body/query/params.
const sanitizeMiddlewares = [mongoSanitize(), xss()];

module.exports = sanitizeMiddlewares;

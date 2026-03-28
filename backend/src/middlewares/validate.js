function validate(schema) {
  return function validator(req, _res, next) {
    const parsed = schema.parse(req.body || {});
    req.validatedBody = parsed;
    next();
  };
}

module.exports = { validate };

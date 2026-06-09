function validate(schema, source = "body") {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return next(error);
    }

    req[source] = value; // Replace with validated/sanitized values
    next();
  };
}

module.exports = validate;

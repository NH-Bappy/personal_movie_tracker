exports.validateRequest = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((err) => {
        return `${err.path.join(".")}: ${err.message}`;
      });

      return res.status(400).json({
        message: errors.join(", "),
      });
    }
    next();
  };
};
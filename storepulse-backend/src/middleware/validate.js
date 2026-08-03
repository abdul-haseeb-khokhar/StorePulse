const validate = (schema) => (req, res, next) => {
    console.log("validate middleware is called");
    const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
    });

    if (!result.success) {
        return res.status(400).json({
            error: 'Validation failed',
            details: result.error.issues.map((e)=> ({
                field: e.path.join('.'),
                message: e.message,
            })),
        });
    }

    req.body = result.data.body ?? req.body;
    req.query = result.data.query ?? req.query;
    req.params = result.data.params ?? req.params;
    next();
}

module.exports = validate;
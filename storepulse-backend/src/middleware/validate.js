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

    req.body = result.data.body;
    next();
}

module.exports = validate;
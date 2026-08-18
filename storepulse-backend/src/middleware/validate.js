/**
 * Generic request-validation middleware factory: runs a Zod schema against
 * body/query/params, rejects with a 400 on failure, and otherwise replaces
 * req.body/query/params with the schema's parsed (coerced/defaulted) output.
 */

/**
 * @param {import('zod').ZodSchema} schema Schema expecting `{ body, query, params }`.
 * @returns {import('express').RequestHandler}
 */
const validate = (schema) => (req, res, next) => {
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
    // Express 5 defines req.query as a getter-only accessor (recomputed from
    // the raw querystring on every read), so a plain `req.query = ...`
    // assignment silently no-ops in this non-strict CommonJS module — the
    // coerced/defaulted values (e.g. page/limit as numbers) never actually
    // reach the controller. Overriding the property descriptor replaces the
    // getter with a plain writable value instead.
    if (result.data.query) {
        Object.defineProperty(req, 'query', {
            value: result.data.query,
            writable: true,
            configurable: true,
            enumerable: true,
        });
    }
    req.params = result.data.params ?? req.params;
    next();
}

module.exports = validate;

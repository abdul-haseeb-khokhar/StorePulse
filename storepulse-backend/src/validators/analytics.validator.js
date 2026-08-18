const {z} = require('zod');

// summary/traffic take a `range` shorthand the controller converts itself
// (see analytics.controller.js's getDateRangeFromQuery) — absent is fine
// (it falls back to 7d there), but a provided value has to be one of the
// three the controller actually knows how to convert.
const rangeQuerySchema = z.object({
    params: z.object({
        siteId: z.string().uuid('Invalid site ID')
    }),
    query: z.object({
        range: z.enum(['7d', '30d', '90d']).optional(),
    })
});

// top-products/top-referrers take the raw boundary instead (see
// analytics.service.js's resolveDateBoundary) — both optional, since
// omitting either falls back to the last 7 days there too. limit is
// capped well above the frontend's actual usage (5) so a legitimate
// caller never notices, but an inflated value can't force a huge query.
const dateBoundaryQuerySchema = z.object({
    params: z.object({
        siteId: z.string().uuid('Invalid site ID')
    }),
    query: z.object({
        startDate: z.string().datetime('startDate must be a valid ISO date').optional(),
        endDate: z.string().datetime('endDate must be a valid ISO date').optional(),
        limit: z.coerce.number().int().min(1).max(50).optional(),
    })
});

module.exports = {rangeQuerySchema, dateBoundaryQuerySchema};

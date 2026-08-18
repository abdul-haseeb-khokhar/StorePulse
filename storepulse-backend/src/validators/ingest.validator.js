/**
 * Zod request schema for the public event-ingest endpoint. This is the only
 * validation standing between the open internet and the ingest pipeline, so
 * it's stricter than the dashboard-facing validators (regex-checked API key,
 * enum-checked event type).
 */
const {z} = require('zod');

const trackEventSchema = z.object({
    body: z.object({
        apiKey: z.string().regex(/^sp_live_[a-f0-9]{32}$/, "Invalid API key."),
        type: z.enum(['PAGE_VIEW', 'PRODUCT_CLICK'], {
            message: 'type must be either PAGE_VIEW or PRODUCT_CLICK'
        }),
        pageUrl: z.string().url("pageUrl must be a valid URL"),
        referrer: z.string().optional().nullable(),
        productId: z.string().optional().nullable(),
        productName: z.string().optional().nullable(),
        visitorId: z.string().uuid('VisitorId must be a valid UUID'),
    }).superRefine((data, ctx) => {
        // productId can't be a plain .required() on the field itself since
        // it's only mandatory for one of the two event types.
        if(data.type === 'PRODUCT_CLICK' && !data.productId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['productId'],
                message: 'productId is required when type is PRODUCT_CLICK'
            });
        }
    })
})

module.exports = { trackEventSchema };

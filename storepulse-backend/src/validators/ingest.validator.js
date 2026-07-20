const {z} = require('zod');

const trackEventSchema = z.object({
    body: z.object({
        apiKey: z.string().min(1, "Api key is required"),
        type: z.enum(['PAGE_VIEW', 'PRODUCT_CLICK'], {
            errorMap: () => ({message: 'type must be either PAGE_VIEW or PRODUCT_CLICK'})
        }),
        pageUrl: z.string().url("pageUrl must be a valid URL"),
        referrer: z.string().optional().nullable(),
        productId: z.string().optional().nullable(),
        visitorId: z.string().min(1, "Missing visitorId"),
    }).superRefine((data, ctx) => {
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
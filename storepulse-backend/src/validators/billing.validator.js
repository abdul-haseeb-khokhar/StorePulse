/**
 * Zod request schemas for the billing module: creating a payment request and
 * paginating a listing.
 */
const {z} = require('zod');

const createPaymentRequestSchema = z.object({
    body: z.object({
        // Free never reaches here (see billing.service.js's requestPayment) —
        // still excluded at the schema level too so a bad request fails
        // validation instead of a service-level AppError.
        plan: z.enum(['Pro', 'Business']),
        billingCycle: z.enum(['monthly', 'yearly']),
        note: z.string().trim().max(200, 'Note is too long').optional(),
    })
});

const paginationSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    })
});

module.exports = {createPaymentRequestSchema, paginationSchema};

const {z} = require('zod');

const updateUserStatusSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid user ID')
    }),
    body: z.object({
        status: z.enum(['Active', 'Banned', 'Deleted'])
    })
});

const userIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid user ID')
    })
});

const listUsersSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        search: z.string().trim().min(1).optional(),
        status: z.enum(['Active', 'Inactive', 'Banned', 'Deleted']).optional(),
    })
});

const listSitesSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        search: z.string().trim().min(1).optional(),
    })
});

const setUserPlanSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid user ID')
    }),
    body: z.object({
        plan: z.enum(['Free', 'Pro', 'Business']),
        // The period's end date isn't picked by hand — the admin only
        // chooses how long it runs, and the server computes the date
        // itself (see config/plans.js's periodEndFromCycle). Irrelevant
        // for Free, so left optional here too.
        billingCycle: z.enum(['monthly', 'yearly']).optional(),
        // Defaults to Active in the service if omitted — this is only for
        // the rarer case where an admin needs to flag something other than
        // "fully active" (e.g. PastDue while chasing up a failed payment)
        // without changing what plan the user is actually on.
        status: z.enum(['Active', 'Trialing', 'PastDue', 'Canceled', 'Paused']).optional(),
    })
});

const listPaymentRequestsSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        status: z.enum(['Pending', 'Approved', 'Rejected']).optional(),
    })
});

const reviewPaymentRequestSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid request ID')
    }),
    body: z.object({
        status: z.enum(['Approved', 'Rejected']),
        note: z.string().trim().max(200, 'Note is too long').optional(),
    })
});

const listAdminLogsSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    })
});

const userBillingHistorySchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid user ID')
    }),
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    })
});

module.exports = {
    updateUserStatusSchema, userIdParamSchema, listUsersSchema, listSitesSchema, setUserPlanSchema,
    listPaymentRequestsSchema, reviewPaymentRequestSchema, listAdminLogsSchema, userBillingHistorySchema,
};

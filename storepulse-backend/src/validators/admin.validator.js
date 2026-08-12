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
        currentPeriodEnd: z.coerce.date().optional()
    })
});

module.exports = {updateUserStatusSchema, userIdParamSchema, listUsersSchema, listSitesSchema, setUserPlanSchema};

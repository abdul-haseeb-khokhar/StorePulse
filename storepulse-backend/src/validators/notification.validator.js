const {z} = require('zod');

const paginationSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    })
});

const notificationIdParamSchema = z.object({
    params: z.object({
        id: z.string().uuid('Invalid notification id'),
    })
});

module.exports = {paginationSchema, notificationIdParamSchema};

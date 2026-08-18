/**
 * Zod request schemas for the sites module: adding a site (with domain
 * normalization) and a site id param.
 */
const {z} = require('zod');

// Accepts a domain with or without a scheme/path (e.g. a user pasting the
// full storefront URL) and normalizes it down to a bare, lowercase host
// before the format check runs.
const domainSchema = z.string()
    .min(1, 'Domain is required')
    .transform((val) => {
        return val
            .replace(/^https?:\/\//, '')
            .replace(/\/.*$/, '')
            .toLowerCase();
    }).refine(
        (val) => /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(val),
        {message: 'Invalid domain format'}
    );

const addSiteSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Site name is required').max(50, 'Site name is too long'),
        domain: domainSchema,
    })
});

const siteIdParamSchema = z.object({
    params: z.object({
        siteId: z.string().uuid('Invalid site ID')
    })
});

module.exports = { addSiteSchema, siteIdParamSchema };

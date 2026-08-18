/**
 * HTTP layer for the sites module: adding sites, listing a user's sites,
 * usage summary, and API key management.
 */
const {addSite, getUserSites, regenerateApiKey, getSiteById, getUsageSummary} = require('./sites.service')

/** POST /sites — adds a new site, enforcing the owner's plan site limit. */
async function addSiteController(req, res, next) {
    try{
        const {name, domain} = req.body;
        const userId = req.user.id;

        const site = await addSite({name, domain, userId});

        res.status(201).json({site})
    } catch(error){
        next(error)
    }
}

/** GET /sites — the logged-in user's sites, each annotated with whether it's currently active under their plan. */
async function getUserSitesController(req, res, next) {
    try{
        const userId = req.user.id;
        const sites = await getUserSites(userId);

        res.status(200).json({sites});
    } catch(error){
        next(error)
    }
}

/** GET /sites/usage — per-site monthly event usage against the plan's quota. */
async function getUsageSummaryController(req, res, next) {
    try {
        const userId = req.user.id;
        const usage = await getUsageSummary(userId);

        res.status(200).json(usage);
    } catch (error) {
        next(error);
    }
}

/** GET /sites/:siteId */
async function getSiteByIdController(req, res, next) {
    try {
        const {siteId} = req.params;
        const userId = req.user.id;

        const site = await getSiteById({siteId,userId});

        res.status(200).json({site})
    } catch (error) {
        next(error)
    }
}

/** PATCH /sites/:siteId/api-key — revokes the old key and issues a new one. */
async function regenerateApiKeyController(req, res, next) {
    try {
        const {siteId} = req.params;
        const userId = req.user.id;
        const site = await regenerateApiKey({siteId, userId});

        res.status(200).json({site})
    } catch (error) {
        next(error)
    }
}

module.exports = {
    addSiteController, getUserSitesController, getSiteByIdController, regenerateApiKeyController, getUsageSummaryController
}

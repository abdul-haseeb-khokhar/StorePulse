const {addSite, getUserSites, regenerateApiKey, getSiteById, getUsageSummary} = require('./sites.service')

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

async function getUserSitesController(req, res, next) {
    try{
        const userId = req.user.id;
        const sites = await getUserSites(userId);

        res.status(200).json({sites});
    } catch(error){
        next(error)
    }
}

async function getUsageSummaryController(req, res, next) {
    try {
        const userId = req.user.id;
        const usage = await getUsageSummary(userId);

        res.status(200).json(usage);
    } catch (error) {
        next(error);
    }
}

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
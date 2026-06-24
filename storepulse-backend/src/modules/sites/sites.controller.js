const {addSite, getUserSites, regenerateApiKey, getSiteById} = require('./sites.service')

async function addSiteController(req, res, next) {
    console.log('addSite controller is runnig')
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
    console.log('getuserSite controller is running')
    try{
        const userId = req.user.id;
        const sites = await getUserSites(userId);

        res.status(200).json({sites});
    } catch(error){
        next(error)
    }
}

async function getSiteByIdController(req, res, next) {
    console.log('getsitebyid controller is runnig')
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
    console.log('regenerateapi key controller is runing')
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
    addSiteController, getUserSitesController, getSiteByIdController, regenerateApiKeyController
}
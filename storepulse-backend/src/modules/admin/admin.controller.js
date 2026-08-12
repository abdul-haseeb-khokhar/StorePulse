const {updateUserStatusService, listUsersService, getUserDetailService, listSitesService, getPlatformStats, setUserPlanService} = require('./admin.service');

async function updateUserStatusController(req, res, next) {
    try{
        const {status} = req.body;
        const userId = req.params.id;
        const adminId = req.admin.id;

        const updatedUser = await updateUserStatusService(userId, status, adminId);

        res.status(200).json(updatedUser);
    }catch(error){
        next(error);
    }
}

async function listUsersController(req, res, next) {
    try{
        const {page, limit, search, status} = req.query;
        const result = await listUsersService({page, limit, search, status});

        res.status(200).json(result);
    }catch(error){
        next(error);
    }
}

async function getUserDetailController(req, res, next) {
    try{
        const {id} = req.params;
        const user = await getUserDetailService(id);

        res.status(200).json({user});
    }catch(error){
        next(error);
    }
}

async function listSitesController(req, res, next) {
    try{
        const {page, limit, search} = req.query;
        const result = await listSitesService({page, limit, search});

        res.status(200).json(result);
    }catch(error){
        next(error);
    }
}

async function getPlatformStatsController(req, res, next) {
    try{
        const stats = await getPlatformStats();

        res.status(200).json({stats});
    }catch(error){
        next(error);
    }
}

async function setUserPlanController(req, res, next) {
    try{
        const {plan, billingCycle} = req.body;
        const userId = req.params.id;
        const adminId = req.admin.id;

        const result = await setUserPlanService({userId, plan, billingCycle, adminId});

        res.status(200).json(result);
    }catch(error){
        next(error);
    }
}

module.exports = {updateUserStatusController, listUsersController, getUserDetailController, listSitesController, getPlatformStatsController, setUserPlanController}

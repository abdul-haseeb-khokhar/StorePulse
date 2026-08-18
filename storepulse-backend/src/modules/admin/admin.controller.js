/**
 * HTTP layer for the admin module. Each handler just pulls request data,
 * delegates to admin.service, and shapes the response — all real logic
 * lives in the service layer.
 */
const {
    updateUserStatusService, listUsersService, getUserDetailService, listSitesService, getPlatformStats,
    setUserPlanService, listPaymentRequestsService, reviewPaymentRequestService,
    listOverLimitUsersService, listAdminLogsService, getUserBillingHistoryService,
    getPendingPaymentRequestCountService,
} = require('./admin.service');

/** PATCH /admin/users/:id/status — activate, ban, or soft-delete a user. */
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

/** GET /admin/users — paginated, searchable, filterable user listing. */
async function listUsersController(req, res, next) {
    try{
        const {page, limit, search, status} = req.query;
        const result = await listUsersService({page, limit, search, status});

        res.status(200).json(result);
    }catch(error){
        next(error);
    }
}

/** GET /admin/users/:id — a single user's full detail, including sites and subscription. */
async function getUserDetailController(req, res, next) {
    try{
        const {id} = req.params;
        const user = await getUserDetailService(id);

        res.status(200).json({user});
    }catch(error){
        next(error);
    }
}

/** GET /admin/sites — paginated, searchable site listing across all users. */
async function listSitesController(req, res, next) {
    try{
        const {page, limit, search} = req.query;
        const result = await listSitesService({page, limit, search});

        res.status(200).json(result);
    }catch(error){
        next(error);
    }
}

/** GET /admin/stats — platform-wide counts for the admin dashboard. */
async function getPlatformStatsController(req, res, next) {
    try{
        const stats = await getPlatformStats();

        res.status(200).json({stats});
    }catch(error){
        next(error);
    }
}

/** PATCH /admin/users/:id/plan — directly set a user's plan/billing cycle/status. */
async function setUserPlanController(req, res, next) {
    try{
        const {plan, billingCycle, status} = req.body;
        const userId = req.params.id;
        const adminId = req.admin.id;

        const result = await setUserPlanService({userId, plan, billingCycle, status, adminId});

        res.status(200).json(result);
    }catch(error){
        next(error);
    }
}

/** GET /admin/payment-requests — paginated listing, optionally filtered by status. */
async function listPaymentRequestsController(req, res, next) {
    try {
        const {page, limit, status} = req.query;
        const result = await listPaymentRequestsService({page, limit, status});

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

/** PATCH /admin/payment-requests/:id — approve or reject a pending payment request. */
async function reviewPaymentRequestController(req, res, next) {
    try {
        const {id} = req.params;
        const {status, note} = req.body;
        const adminId = req.admin.id;

        const result = await reviewPaymentRequestService({requestId: id, status, note, adminId});

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

/** GET /admin/users/over-limit — users whose site count exceeds their plan's limit. */
async function listOverLimitUsersController(req, res, next) {
    try {
        const users = await listOverLimitUsersService();

        res.status(200).json({users});
    } catch (error) {
        next(error);
    }
}

/** GET /admin/logs — paginated admin activity log (superadmin only). */
async function listAdminLogsController(req, res, next) {
    try {
        const {page, limit} = req.query;
        const result = await listAdminLogsService({page, limit});

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

/** GET /admin/users/:id/history — a user's subscription/billing history. */
async function getUserBillingHistoryController(req, res, next) {
    try {
        const {id} = req.params;
        const {page, limit} = req.query;
        const result = await getUserBillingHistoryService(id, {page, limit});

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

/** GET /admin/payment-requests/pending-count — badge count for the admin nav. */
async function getPendingPaymentRequestCountController(req, res, next) {
    try {
        const result = await getPendingPaymentRequestCountService();

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    updateUserStatusController, listUsersController, getUserDetailController, listSitesController,
    getPlatformStatsController, setUserPlanController, listPaymentRequestsController, reviewPaymentRequestController,
    listOverLimitUsersController, listAdminLogsController, getUserBillingHistoryController,
    getPendingPaymentRequestCountController,
}

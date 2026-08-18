/**
 * HTTP layer for billing: payment requests, subscription cancellation, and
 * billing history. Subscription read/cancel logic lives in the
 * subscription module and is just re-exposed here under /billing.
 */
const {requestPayment, listOwnPaymentRequests} = require('./billing.service');
const {cancelSubscription, getSubscriptionHistoryService} = require('../subscription/subscription.service');

/** POST /billing/payment-requests — submit a payment request for a paid plan. */
async function createPaymentRequestController(req, res, next) {
    try {
        const {plan, billingCycle, note} = req.body;
        const request = await requestPayment(req.user.id, {plan, billingCycle, note});

        res.status(201).json({request});
    } catch (error) {
        next(error);
    }
}

/** GET /billing/payment-requests — the logged-in user's own payment request history. */
async function listPaymentRequestsController(req, res, next) {
    try {
        const {page, limit} = req.query;
        const result = await listOwnPaymentRequests(req.user.id, {page, limit});

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

/** POST /billing/cancel — schedules the user's subscription to drop to Free at period end. */
async function cancelSubscriptionController(req, res, next) {
    try {
        const subscription = await cancelSubscription(req.user.id);

        res.status(200).json({
            subscription,
            message: `Your plan will move to Free on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}.`,
        });
    } catch (error) {
        next(error);
    }
}

/** GET /billing/history — the logged-in user's subscription/billing history. */
async function getBillingHistoryController(req, res, next) {
    try {
        const {page, limit} = req.query;
        const result = await getSubscriptionHistoryService(req.user.id, {page, limit});

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createPaymentRequestController, listPaymentRequestsController,
    cancelSubscriptionController, getBillingHistoryController,
}

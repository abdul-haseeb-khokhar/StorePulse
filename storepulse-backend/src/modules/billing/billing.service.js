/**
 * Business logic for the user-facing side of billing: submitting a payment
 * request and listing your own request history. Approval/rejection lives
 * in the admin module (admin.service.js), which owns the actual plan write.
 */
const {createPendingRequestIfNone, listRequestsByUserId} = require('../paymentRequest/paymentRequest.repository');
const AppError = require('../../utils/AppError');

/**
 * Submits a payment request for a paid plan.
 *
 * Free needs no payment (BillingPay.jsx shows a "no payment needed" card
 * for it instead of bank details), so there's nothing to submit a request
 * for. Mirrors the same plan-enum check the admin side already trusts.
 *
 * The pending-request check and the create happen under a locked
 * transaction (createPendingRequestIfNone) rather than as two separate
 * calls here, so rapid duplicate submissions can't both pass the check
 * before either write lands.
 *
 * @param {string} userId
 * @param {{plan: 'Pro'|'Business', billingCycle: 'monthly'|'yearly', note?: string}} args
 */
async function requestPayment(userId, {plan, billingCycle, note}) {
    if (plan === 'Free') {
        throw new AppError('The Free plan has no payment to submit.', 400);
    }

    const {request, alreadyPending} = await createPendingRequestIfNone({userId, plan, billingCycle, note});
    if (alreadyPending) {
        throw new AppError(
            'You already have a pending payment request. Wait for it to be reviewed before submitting another.',
            409,
        );
    }

    return request;
}

/** Paginated payment-request history for one user. */
async function listOwnPaymentRequests(userId, {page = 1, limit = 20} = {}) {
    const skip = (page - 1) * limit;
    const {requests, total} = await listRequestsByUserId(userId, {skip, take: limit});
    return {requests, total, page, limit, totalPages: Math.ceil(total / limit) || 1};
}

module.exports = {requestPayment, listOwnPaymentRequests}

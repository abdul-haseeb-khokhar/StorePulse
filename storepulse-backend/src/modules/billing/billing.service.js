const {createPaymentRequest, findPendingRequestByUserId, listRequestsByUserId} = require('../paymentRequest/paymentRequest.repository');
const AppError = require('../../utils/AppError');

// Free needs no payment (BillingPay.jsx shows a "no payment needed" card
// for it instead of bank details), so there's nothing to submit a request
// for. Mirrors the same plan-enum check the admin side already trusts.
async function requestPayment(userId, {plan, billingCycle, note}) {
    if (plan === 'Free') {
        throw new AppError('The Free plan has no payment to submit.', 400);
    }

    const existingPending = await findPendingRequestByUserId(userId);
    if (existingPending) {
        throw new AppError(
            'You already have a pending payment request. Wait for it to be reviewed before submitting another.',
            409,
        );
    }

    return createPaymentRequest({userId, plan, billingCycle, note});
}

async function listOwnPaymentRequests(userId, {page = 1, limit = 20} = {}) {
    const skip = (page - 1) * limit;
    const {requests, total} = await listRequestsByUserId(userId, {skip, take: limit});
    return {requests, total, page, limit, totalPages: Math.ceil(total / limit) || 1};
}

module.exports = {requestPayment, listOwnPaymentRequests}

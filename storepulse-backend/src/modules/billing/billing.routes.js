/**
 * Billing module routes. All require a logged-in user.
 */
const express = require('express');
const {
    createPaymentRequestController, listPaymentRequestsController,
    cancelSubscriptionController, getBillingHistoryController,
} = require('./billing.controller');
const protect = require('../../middleware/protect');
const validate = require('../../middleware/validate');
const {createPaymentRequestSchema, paginationSchema} = require('../../validators/billing.validator');

const router = express.Router();

router.use(protect);

router.post('/payment-requests', validate(createPaymentRequestSchema), createPaymentRequestController);
router.get('/payment-requests', validate(paginationSchema), listPaymentRequestsController);
router.post('/cancel', cancelSubscriptionController);
router.get('/history', validate(paginationSchema), getBillingHistoryController);

module.exports = router;

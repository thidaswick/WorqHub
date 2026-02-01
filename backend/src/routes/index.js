/**
 * Mount all API routes under /api/v1.
 */
const express = require('express');
const auth = require('./auth');
const tenants = require('./tenants');
const workOrders = require('./workOrders');

const router = express.Router();

router.use('/auth', auth);
router.use('/tenants', tenants);
router.use('/work-orders', workOrders);

// Placeholder routes (implement controllers when needed)
// router.use('/customers', customers);
// router.use('/inventory', inventory);
// router.use('/billing', billing);
// router.use('/reports', reports);

module.exports = router;

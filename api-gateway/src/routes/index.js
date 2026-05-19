const express = require('express');
const router = express.Router();
const orderRoutes = require('./orders');
const deliveryRoutes = require('./deliveries');
const trackingRoutes = require('./tracking');

router.use('/orders', orderRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/tracking', trackingRoutes);

module.exports = router;

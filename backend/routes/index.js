const express = require('express');
const userRouter = require('./user1');
const itemRouter = require('./items');
const orderRouter = require('./order');
const router = express.Router();
router.use('/user1', userRouter);
router.use('/item', itemRouter);
router.use('/order', orderRouter);
module.exports = router;
const express = require('express');
const { authMiddleware } = require('../middleware/middleware');
const { User, Item, Order } = require('../db');
const router = express.Router();

router.get('/buyer/my-orders', authMiddleware, async (req, res) => {
    const user=await User.findById(req.userId);
    const bool=user.roles.includes('buyer');
    if(!bool){
        return res.status(403).json({message:"Only buyers can view their orders"});
    }
    const oreders=await Order.find({buyer:user._id});
    res.json({orders:oreders});
});
router.put('/buyer/place-order/:id', authMiddleware, async (req, res) => {
    const user=await User.findById(req.userId);
    const bool=user.roles.includes('buyer');
    if(!bool){
        return res.status(403).json({message:"Only buyers can place orders"});
    }
    const orderedItemId=req.params.id;
    const order=await Order.findById(orderedItemId);
    if (order.status=="pending"){
        order.status="confirmed";
        await order.save();

    }
    res.json({message:"Order placed successfully",order});


});
router.get('/supplier/orders/:id', authMiddleware, async (req, res) => {
    const user=await User.findById(req.userId);
    const bool=user.roles.includes('supplier');
    if(!bool){
        return res.status(403).json({message:"Only suppliers can view their orders"});
    }
    const buyerId=req.params.id;
    const bool1=await User.findById(buyerId);
    const order=await Order.find({
        buyer:buyerId,
        supplier:user._id,
        status:"confirmed"
    });
    return res.json({orders:order});
});
module.exports = router;
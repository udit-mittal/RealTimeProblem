const express =require('express');
const {User,Item,Order} = require('../db');
const { authMiddleware } = require('../middleware/middleware');
const router=express.Router();
router.post('/supplier/add-item',authMiddleware,async(req,res)=>{
    
    const user=await User.findById(req.userId);
    const bool=user.roles.includes('supplier');
    if(!bool){
        return res.status(403).json({message:"Only suppliers can add items"});
    }
    const{name,description,quantity,price}=req.body;
    const newItem=new Item({
        supplierId:user._id,
        name,
        description,
        quantity,
        price
    });
    await newItem.save();
    res.json({message:"Item added successfully",item:newItem});
});
router.put('/supplier/update-item/:id',authMiddleware,async(req,res)=>{
    const user=await User.findById(req.userId);
    const bool=user.roles.includes('supplier');
    if(!bool){
        return res.status(403).json({message:"Only suppliers can update items"});
    }
    const itemId=req.params.id;
    const {name,description,quantity,price}=req.body;
    const item=await Item.findOne({_id:itemId,supplierId:user._id});
    if (name) item.name=req.body.name;
    if (description) item.description=req.body.description;
    if (quantity) item.quantity=req.body.quantity;
    if (price) item.price=req.body.price;
    await item.save();
    res.json({message:"Item updated successfully",item});
});
router.get("/supplier/items/:id",authMiddleware,async(req,res)=>{
    const user=await User.findById(req.userId);
    const bool = user.roles.includes('buyer');
    if(!bool){
        return res.status(403).json({message:"Only buyers can view item details"});
    }
    const supplierId=req.params.id;
    const bool1=await User.findById(supplierId);
    if(!bool1 || !bool1.roles.includes('supplier')){
        return res.status(404).json({message:"Supplier not found"});
    }
    const filter=req.query.filter || '';
    const filters={};
    filters.supplierId=supplierId;
    filters.$or=[{name:{"$regex":filter}}]
    const items = await Item.find(filters);
    res.json({items});
});


router.get("/supplier/my-items",authMiddleware,async(req,res)=>{
    const user=await User.findById(req.userId);
    const bool=user.roles.includes('supplier');
    if(!bool){
        return res.status(403).json({message:"Only suppliers can view their items"});
    }
    const filter=req.query.filter || '';
    const filters={};
    filters.supplierId=user._id;
    filters.$or=[{name:{"$regex":filter}}]
    const items = await Item.find(filters);
    res.json({items});
});
router.get('/all-items',async(req,res)=>{
    const filter=req.query.filter || '';

    const items=await Item.find({
        $or:[{
            name:{"$regex":filter}
        }]
    });
    res.json({items});
});
router.post('/buyer/place-order',authMiddleware,async(req,res)=>{
    const user=await User.findById(req.userId);
    const bool=user.roles.includes('buyer');
    if(!bool){
        return res.status(403).json({message:"Only buyers can place orders"});
    }
    const {supplierId,items}=req.body;
    const itemIds=items.map(i=>i.itemId);
    const vaildItems=await Item.find({_id:{$in:itemIds},supplierId})
    const orderItems=items.map(i=>{
        const product=vaildItems.find(it=>it._id.toString()===i.itemId);
        return {
            item:product._id,
            quantity:Number(i.quantity),
            unit:product.quantity.unit || "pcs",
            price:Number(product.price)
        }
    })
    console.log(orderItems);
    const totalAmount=orderItems.reduce((sum,i)=> sum+i.price*i.quantity,0);
    console.log(totalAmount);
    const newOrder=new Order({
        buyer:user._id,
        supplier:supplierId,
        items:orderItems,
        totalAmount
    });
    await newOrder.save();
    res.json({message:"Order placed successfully",order:newOrder});
})
module.exports=router;
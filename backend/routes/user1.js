require("dotenv").config();
const express = require('express');
const router = express.Router();
const zod = require('zod');
const {User,Item,Order} = require('../db');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require("../middleware/middleware");
const JWT_SECRET = process.env.JWT_SECRET;

const signupbody=zod.object({
    username:zod.string().min(3),
    email:zod.string(),
    phone:zod.string().min(10).max(10),
    password:zod.string(),
    roles:zod.enum(['buyer','supplier','both'])
})
router.post('/signup',async(req,res)=>{
    const {success} = signupbody.safeParse(req.body);
    if(!success){
        return res.status(400).json({message:"Invalid request body"})
    }
     const existingUser=await User.findOne({
        email:req.body.email
     })
    if (existingUser){
        return res.status(400).json({message:"User already exists"})
    }
   const newUser=await User.create({
    username:req.body.username,
    email:req.body.email,
    phone:req.body.phone,
    password:req.body.password,
    roles:req.body.roles==='both'?['buyer','supplier']:[req.body.roles]
   })
   const userId=newUser._id;
   const token =  jwt.sign({
       userId
   },JWT_SECRET);
   res.json({message:"User created successfully",token});
});
 const signinbody=zod.object({
    email:zod.string(),
    password:zod.string()
 })
router.post("/signin",async(req,res)=>{
    const {success} = signinbody.safeParse(req.body);
    if(!success){
        return res.status(400).json({message:"Invalid request body"})
    }
    const user=await User.findOne({
        email:req.body.email,
        password:req.body.password
    });
    if(user){
        const token=jwt.sign({
            userId:user._id
        },JWT_SECRET);
        res.json({
            token:token,
        })
        return;
    }
    res.status(400).json({message:"Invalid email or password"});
})
router.post('/:id/follow',authMiddleware,async(req,res)=>{
    const userId=req.userId;
    const toFollowId=req.params.id;
    if(userId===toFollowId){
        return res.status(400).json({message:"You cannot follow yourself"});
    }
    const relation= {
        userId:toFollowId,
        asBuyer: false,
        asSupplier: false
    };
    const user=await User.findById(toFollowId);
    if(user.roles.includes('buyer')){
        relation.asBuyer=true;
    }
    else{
        relation.asSupplier=true;
    }
    await User.findByIdAndUpdate(userId,{
        $addToSet:{relations:relation     
    }
    });
    const relation2={
        userId:userId,
        asBuyer:false,
        asSupplier:false
    }
    const user2=await User.findById(userId);
    if(user2.roles.includes('buyer')){
        relation2.asBuyer=true;
    }
    else{
        relation2.asSupplier=true;
    }
    await User.findByIdAndUpdate(toFollowId,{
        $addToSet:{relations:relation2}
    });
    res.json({message:"Successfully followed the user"});
});
router.get('/follower',authMiddleware,async(req,res)=>{
    const userId=req.userId;
    const user=await User.findById(userId).populate('relations.userId','username email phone roles');
    if(!user){
        return res.status(404).json({message:"User not found"});
    }
    const followers=user.relations.map(r=>r.userId);
    res.json({followers:followers});
});
router.get('/allusers',authMiddleware,async(req,res)=>{
    const filter=req.query.filter || "";
    const users=await User.find({
        $or:[{
            username:{"$regex":filter}
        }]
    })
    res.json({
        user:users.map(user=>({
            username:user.username,
            email:user.email,
            phone:user.phone,
            roles:user.roles
        }))
    })

});
module.exports = router;
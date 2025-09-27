const mongoose = require('mongoose');
require('dotenv').config(); // Load .env

const uri = process.env.MONGO_URI;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
module.exports=mongoose;
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },

    // by default ek user dono role rakh sakta hai
    roles: {
      type: [String],
      enum: ["buyer", "supplier"],
      default: ["buyer"],
    },

    // relationship store karenge
    relations: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        asBuyer: { type: Boolean, default: false },   // is user ke liye mai buyer hu?
        asSupplier: { type: Boolean, default: false } // is user ke liye mai supplier hu?
      }
    ]
  },
  { timestamps: true }
);


const itemSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // supplier ki ID
      required: true,
    },
    name: { type: String, required: true },       // maal ka naam
    description: { type: String },                // details
    quantity: {
      value: { type: Number, default: 0 },        // 10, 500, etc
      unit: { type: String, default: "pcs" }      // gm, kg, litre, packet, pcs, etc
    },
    price: { type: Number },                      // per unit price
    photoUrl: { type: String },                   // maal ki photo (optional)
  },
  { timestamps: true }
);
// models/Order.js


const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // jisne order kiya
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // jis supplier se order kiya
      required: true,
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item", // konsa saman order kiya
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        unit: {
          type: String, // kg, g, piece, etc.
          required: true,
        },
        price: {
          type: Number, // supplier ke hisab se price
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const User=mongoose.model("User",userSchema);
const Item=mongoose.model("Item",itemSchema);
const Order=mongoose.model("Order",orderSchema);
module.exports={User,Item,Order};
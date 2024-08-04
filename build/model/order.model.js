"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const orderSchema = new mongoose_1.default.Schema({
    shippingInfo: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true, default: "India" },
        pinCode: { type: Number, required: true },
        phoneNo: { type: Number, required: true }
    },
    orderItems: [{
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true },
            product: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Product', required: true }
        }],
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    // paymentInfo: {
    //   id: { type: String, required: true },
    //   status: { type: String, required: true },
    //   razorpay_order_id: { type: String } ,
    //   razorpay_payment_id: {type: String,},
    //   razorpay_signature: {type: String,},
    // },
    paidAt: { type: Date, required: true },
    itemsPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    orderStatus: { type: String, required: true, default: 'Processing' },
    deliveredAt: Date,
    createdAt: { type: Date, default: Date.now }
});
const Order = mongoose_1.default.model("Order", orderSchema);
exports.default = Order;

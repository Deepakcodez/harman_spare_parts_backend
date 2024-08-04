"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const orderSchema = new mongoose_1.default.Schema({
    shippingInfo: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'ShippingInfo', required: true },
    orderItems: [{
            name: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
            image: { type: String, required: true },
            product: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Product', required: true }
        }],
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    paymentInfo: {
        status: { type: String, required: true, default: "Pending" },
        razorpay_order_id: { type: String, required: true, }
    },
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

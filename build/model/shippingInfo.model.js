"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const shippinginfoSchema = new mongoose_1.default.Schema({
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true, default: "India" },
    pinCode: { type: Number, required: true },
    phoneNo: { type: Number, required: true },
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    deliveredAt: { type: Date, },
    createdAt: { type: Date, default: Date.now }
});
const ShippingInfo = mongoose_1.default.model("ShippingInfo", shippinginfoSchema);
exports.default = ShippingInfo;

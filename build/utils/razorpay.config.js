"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRazorpayInstance = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const createRazorpayInstance = () => {
    return new razorpay_1.default({
        key_id: process.env.RAZORPAY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
    });
};
exports.createRazorpayInstance = createRazorpayInstance;

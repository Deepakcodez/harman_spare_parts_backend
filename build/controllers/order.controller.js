"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.getAllOrders = exports.myOrders = exports.getSingleOrder = exports.newOrder = void 0;
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const order_model_1 = __importDefault(require("../model/order.model"));
const errorHandler_1 = require("../utils/errorHandler");
// Create new Order
exports.newOrder = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice, } = req.body;
    const order = yield order_model_1.default.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
    });
    res.status(201).json({
        success: true,
        order,
    });
}));
// get Single Order
exports.getSingleOrder = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.default.findById(req.params.id).populate("user", "name email");
    if (!order) {
        return next(new errorHandler_1.ErrorHandler("Order not found with this Id", 404));
    }
    res.status(200).json({
        success: true,
        order,
    });
}));
// get logged in user  Orders
exports.myOrders = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const orders = yield order_model_1.default.find({ user: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id });
    res.status(200).json({
        success: true,
        orders,
    });
}));
// get all Orders -- Admin
exports.getAllOrders = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order_model_1.default.find();
    let totalAmount = 0;
    orders.forEach((order) => {
        totalAmount += order.totalPrice;
    });
    res.status(200).json({
        success: true,
        totalAmount,
        orders,
    });
}));
// delete Order -- Admin
exports.deleteOrder = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.default.findByIdAndDelete(req.params.id);
    if (!order) {
        return next(new errorHandler_1.ErrorHandler("Order not found with this Id", 404));
    }
    res.status(200).json({
        success: true,
        message: "Order removed",
        order
    });
}));

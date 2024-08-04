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
exports.updateOrder = exports.deleteOrder = exports.getAllOrders = exports.myOrders = exports.getSingleOrder = exports.paymentVerify = exports.newOrder = exports.shippingAddress = void 0;
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const order_model_1 = __importDefault(require("../model/order.model"));
const errorHandler_1 = require("../utils/errorHandler");
const product_model_1 = __importDefault(require("../model/product.model"));
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const shippingInfo_model_1 = __importDefault(require("../model/shippingInfo.model"));
const keyId = process.env.RAZORPAY_ID;
const keySecret = process.env.RAZORPAY_SECRET;
// Function to generate a random receipt ID
const generateReceiptId = () => {
    return crypto_1.default.randomBytes(16).toString("hex");
};
// //shipping address
exports.shippingAddress = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { address, city, state, country, pinCode, phoneNo } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const shippingDetail = {
        address,
        city,
        state,
        country,
        pinCode,
        phoneNo,
        user: userId
    };
    try {
        if (!address || !city || !state || !country || !pinCode || !phoneNo) {
            return next(new errorHandler_1.ErrorHandler("Provide all details", 404));
        }
        const shipping = yield shippingInfo_model_1.default.findOne({ user: userId });
        if (shipping) {
            // Update existing shipping address
            shipping.address = address;
            shipping.city = city;
            shipping.state = state;
            shipping.country = country;
            shipping.pinCode = pinCode;
            shipping.phoneNo = phoneNo;
            yield shipping.save();
        }
        else {
            // Create new shipping address
            yield shippingInfo_model_1.default.create(shippingDetail);
        }
        res.status(200).json({
            success: true,
            message: shipping ? "Shipping address updated successfully" : "Shipping address created successfully",
        });
    }
    catch (error) {
        console.error("Error in saving shipping info:", error);
        res.status(500).json({
            success: false,
            message: "Unable to save shipping info. Please try again.",
        });
    }
}));
// Create new Order
exports.newOrder = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice, } = req.body;
    try {
        if (!keyId || !keySecret) {
            throw new Error("Razorpay key ID or key secret is not defined in environment variables");
        }
        const razorpay = new razorpay_1.default({
            key_id: keyId,
            key_secret: keySecret,
        });
        const receiptId = generateReceiptId();
        const options = {
            amount: totalPrice * 100,
            currency: "INR",
            receipt: receiptId,
        };
        const razorpayOrder = yield razorpay.orders.create(options);
        const order = yield order_model_1.default.create({
            shippingInfo,
            orderItems,
            paymentInfo: Object.assign(Object.assign({}, paymentInfo), { razorpay_order_id: razorpayOrder.id }),
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paidAt: Date.now(),
            user: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
        });
        const populatedOrder = yield order.populate('user');
        res.status(201).json({
            success: true,
            order: populatedOrder,
            razorpayOrder,
        });
    }
    catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({
            success: false,
            message: "Unable to create order. Please try again.",
        });
    }
}));
exports.paymentVerify = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto_1.default
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");
    const isAuthentic = expectedSignature === razorpay_signature;
    if (isAuthentic) {
        // Database comes here
        // await Payment.create({
        //   razorpay_order_id,
        //   razorpay_payment_id,
        //   razorpay_signature,
        // });
        res.redirect(`http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`);
    }
    else {
        res.status(400).json({
            success: false,
        });
    }
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
    var _c;
    const orders = yield order_model_1.default.find({ user: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id }).populate('user');
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
        order,
    });
}));
// update Order Status -- Admin
exports.updateOrder = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const order = yield order_model_1.default.findById(req.params.id);
    if (!order) {
        return next(new errorHandler_1.ErrorHandler("Order not found with this Id", 404));
    }
    if (order.orderStatus === "Delivered") {
        return next(new errorHandler_1.ErrorHandler("You have already delivered this order", 400));
    }
    if (req.body.status === "Shipped") {
        order.orderItems.forEach((o) => __awaiter(void 0, void 0, void 0, function* () {
            yield updateStock(o.product.toString(), o.quantity);
        }));
    }
    order.orderStatus = req.body.status;
    if (req.body.status === "Delivered") {
        order.deliveredAt = new Date();
    }
    yield order.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
        message: "Order updated",
    });
}));
function updateStock(id, quantity) {
    return __awaiter(this, void 0, void 0, function* () {
        const product = yield product_model_1.default.findById(id);
        if (product) {
            product.stock -= quantity;
            yield product.save({ validateBeforeSave: false });
        }
        else {
            throw new errorHandler_1.ErrorHandler("Product not found", 404);
        }
    });
}

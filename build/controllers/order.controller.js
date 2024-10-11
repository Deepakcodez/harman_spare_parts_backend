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
exports.updateOrder = exports.deleteOrder = exports.getAllOrders = exports.myOrders = exports.getSingleOrder = exports.paymentVerify = exports.newOrder = void 0;
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const order_model_1 = __importDefault(require("../model/order.model"));
const errorHandler_1 = require("../utils/errorHandler");
const product_model_1 = __importDefault(require("../model/product.model"));
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const payment_model_1 = __importDefault(require("../model/payment.model"));
const user_model_1 = __importDefault(require("../model/user.model"));
const cart_model_1 = __importDefault(require("../model/cart.model"));
const keyId = process.env.RAZORPAY_ID;
const keySecret = process.env.RAZORPAY_SECRET;
// Function to generate a random receipt ID
const generateReceiptId = () => {
    return crypto_1.default.randomBytes(16).toString("hex");
};
// Create new Order
exports.newOrder = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { shippingInfo, orderItems, itemsPrice, taxPrice, shippingPrice, totalPrice, userMessage, paymentInfo, } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const paymentMethod = paymentInfo.method;
    console.log(">>>>>>>>>>>inside new order controller", paymentMethod);
    const keyId = process.env.RAZORPAY_ID;
    const keySecret = process.env.RAZORPAY_SECRET;
    try {
        let paymentInfo = {};
        // Check if payment method is Online Payment and handle Razorpay order creation
        if (paymentMethod === "online") {
            if (!keyId || !keySecret) {
                throw new Error("Razorpay key ID or key secret is not defined in environment variables");
            }
            const razorpay = new razorpay_1.default({
                key_id: keyId,
                key_secret: keySecret,
            });
            const receiptId = generateReceiptId(); // Generate unique receipt ID
            const options = {
                amount: totalPrice * 100, // Amount in paisa (₹1 = 100 paise)
                currency: "INR",
                receipt: receiptId,
            };
            // Create the Razorpay order
            const razorpayOrder = yield razorpay.orders.create(options);
            paymentInfo = {
                razorpay_order_id: razorpayOrder.id,
                method: "online",
                status: "Pending", // Initially pending until the payment is confirmed
            };
            // Create the order in the database
            const order = yield order_model_1.default.create({
                shippingInfo,
                orderItems,
                paymentInfo,
                itemsPrice,
                taxPrice,
                userMessage,
                shippingPrice,
                totalPrice,
                paidAt: Date.now(), // Razorpay doesn't confirm payment instantly
                user: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
            });
            const populatedOrder = yield order.populate("user");
            res.status(201).json({
                success: true,
                order: populatedOrder,
                razorpayOrder, // Send back Razorpay order details
            });
        }
        else if (paymentMethod === "cod") {
            // If payment method is COD, place the order without Razorpay
            paymentInfo = {
                method: "Cash-On-Delivery",
                status: "Pending", // Status is pending for COD orders
            };
            const order = yield order_model_1.default.create({
                shippingInfo,
                orderItems,
                paymentInfo,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                userMessage,
                paidAt: null, // Will be null since it's not paid yet (COD)
                user: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id,
            });
            const populatedOrder = yield order.populate("user");
            yield user_model_1.default.updateOne({ _id: (_d = req.user) === null || _d === void 0 ? void 0 : _d._id }, { $push: { myOrders: populatedOrder === null || populatedOrder === void 0 ? void 0 : populatedOrder._id } });
            //empty the cart
            yield cart_model_1.default.updateOne({ userId }, {
                $set: {
                    products: [],
                    totalPrice: 0,
                },
            });
            res.status(201).json({
                success: true,
                order: populatedOrder,
                message: "Order placed with Cash on Delivery",
            });
        }
        else {
            // If payment method is invalid, return an error
            res.status(400).json({
                success: false,
                message: "Invalid payment method",
            });
        }
    }
    catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({
            success: false,
            message: "Unable to create order. Please try again.",
        });
    }
}));
// export const newOrder = asyncHandler(
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     const userId = req.user?._id;
//     const {
//       shippingInfo,
//       orderItems,
//       itemsPrice,
//       paymentInfo,
//       taxPrice,
//       shippingPrice,
//       totalPrice,
//       userMessagehttp://localhost:3000/
//     } = req.body;
//     const order = await Order.create({
//       shippingInfo,
//       orderItems,
//       paymentInfo,
//       itemsPrice,
//       taxPrice,
//       shippingPrice,
//       totalPrice,
//       userMessage,
//       paidAt: Date.now(),
//       user: req.user?._id,
//     });
//     const populatedOrder = await order.populate("user");
//     await User.updateOne(
//       { _id: userId },
//       { $push: { myOrders: populatedOrder?._id } }
//     );
//     //empty the cart
//     await Cart.updateOne({userId}, {
//       $set: {
//         products: [],
//         totalPrice: 0,
//       },
//     });
//     res.status(201).json({
//       success: true,
//       order: populatedOrder,
//     });
//   }
// );
exports.paymentVerify = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        // 1. Check if all the necessary data is provided
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return next(new errorHandler_1.ErrorHandler("Missing payment details", 400));
        }
        // 2. Create body string to verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        // 3. Generate expected signature using HMAC SHA256
        const expectedSignature = crypto_1.default
            .createHmac("sha256", process.env.RAZORPAY_SECRET)
            .update(body)
            .digest("hex");
        // 4. Verify if the signature matches
        const isAuthentic = expectedSignature === razorpay_signature;
        if (isAuthentic) {
            // Payment is authentic
            // 5. Save payment info in the database
            yield payment_model_1.default.create({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            });
            // 6. Update the order with success status
            const updatedOrder = yield order_model_1.default.findOneAndUpdate({ "paymentInfo.razorpay_order_id": razorpay_order_id }, { $set: { "paymentInfo.status": "Success" } }, { new: true });
            if (!updatedOrder) {
                return next(new errorHandler_1.ErrorHandler("Order not found", 404));
            }
            // 7. Redirect to the success page with payment reference
            res.redirect(`http://localhost:3000/products?reference=${razorpay_payment_id}`);
        }
        else {
            // Signature mismatch
            res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }
    }
    catch (error) {
        console.error("Payment verification error:", error);
        next(new errorHandler_1.ErrorHandler("Internal server error", 500));
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
    var _e;
    const orders = yield order_model_1.default.find({ user: (_e = req.user) === null || _e === void 0 ? void 0 : _e._id }).populate("user");
    res.status(200).json({
        success: true,
        orders,
    });
}));
// get all Orders -- Admin
exports.getAllOrders = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order_model_1.default.find().populate("shippingInfo user");
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
    const { orderId, paymentStatus, orderStatus } = req.body;
    const order = yield order_model_1.default.findById(orderId);
    if (!order) {
        return next(new errorHandler_1.ErrorHandler("Order not found with this Id", 404));
    }
    if (order.orderStatus === "Delivered") {
        return next(new errorHandler_1.ErrorHandler("You have already delivered this order", 400));
    }
    if (orderStatus === "Delivered") {
        order.orderItems.forEach((o) => __awaiter(void 0, void 0, void 0, function* () {
            yield updateStock(o.product.toString(), o.quantity);
        }));
    }
    order.orderStatus = orderStatus;
    order.paymentInfo.status = paymentStatus;
    if (orderStatus === "Delivered") {
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

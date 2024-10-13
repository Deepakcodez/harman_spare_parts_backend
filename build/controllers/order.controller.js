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
exports.updateOrder = exports.deleteOrder = exports.getAllOrders = exports.myOrders = exports.getSingleOrder = exports.newOrder = exports.paymentVerify = exports.createRazorpayOrderOfCart = exports.createRazorpayOrder = void 0;
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const order_model_1 = __importDefault(require("../model/order.model"));
const errorHandler_1 = require("../utils/errorHandler");
const product_model_1 = __importDefault(require("../model/product.model"));
const crypto_1 = __importDefault(require("crypto"));
const payment_model_1 = __importDefault(require("../model/payment.model"));
const user_model_1 = __importDefault(require("../model/user.model"));
const cart_model_1 = __importDefault(require("../model/cart.model"));
const razorpay_config_1 = require("../utils/razorpay.config");
const keyId = process.env.RAZORPAY_ID;
const keySecret = process.env.RAZORPAY_SECRET;
// Function to generate a random receipt ID
const generateReceiptId = () => {
    return crypto_1.default.randomBytes(16).toString("hex");
};
const createRazorpayOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { productId, shippingInfo, userMessage } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        // Find the product by productId from the database
        const product = yield product_model_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        // Verify the actual price of the product stored in the database
        const amount = product.price;
        // Generate receipt ID for the Razorpay order
        const receiptId = generateReceiptId();
        // Razorpay order options
        const options = {
            amount: amount * 100, // Amount in paise (INR)
            currency: "INR",
            receipt: receiptId,
        };
        const razorpayInstance = (0, razorpay_config_1.createRazorpayInstance)();
        // Create the Razorpay order
        razorpayInstance.orders.create(options, (error, razorpayOrder) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Something went wrong while creating the Razorpay order",
                    error,
                });
            }
            else {
                // Create the new order in the database with the Razorpay order ID
                const newOrder = yield order_model_1.default.create({
                    shippingInfo,
                    user: userId,
                    orderItems: [
                        {
                            name: product.name,
                            price: product.price,
                            quantity: 1,
                            image: product.images[0].url,
                            product: product._id,
                        },
                    ],
                    paymentInfo: {
                        method: "Online-Payment",
                        status: "Pending",
                        razorpay_order_id: razorpayOrder.id,
                    },
                    itemsPrice: product.price,
                    taxPrice: 0, // Add tax logic if applicable
                    shippingPrice: 0, // Add shipping cost logic if applicable
                    totalPrice: product.price,
                    orderStatus: "Processing",
                    isCOD: false,
                    userMessage,
                });
                return res.json({
                    success: true,
                    message: "Razorpay order created successfully",
                    razorpayOrder, // Razorpay order details
                    // Newly created order details
                });
            }
        }));
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Order creation failed",
            error,
        });
    }
});
exports.createRazorpayOrder = createRazorpayOrder;
const createRazorpayOrderOfCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { cartId, shippingInfo, userMessage } = req.body;
        const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id; // Assuming req.user is populated with user details via middleware
        // Find the cart by cartId
        const cart = yield cart_model_1.default.findById(cartId).populate("products.product.productId");
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }
        // Verify the total price from the cart
        const amount = cart.totalPrice;
        // Generate receipt ID for the Razorpay order
        const receiptId = generateReceiptId();
        // Razorpay order options
        const options = {
            amount: amount * 100, // Amount in paise (INR)
            currency: "INR",
            receipt: receiptId,
        };
        const razorpayInstance = (0, razorpay_config_1.createRazorpayInstance)();
        // Create the Razorpay order
        razorpayInstance.orders.create(options, (error, razorpayOrder) => __awaiter(void 0, void 0, void 0, function* () {
            if (error) {
                return res.status(500).json({
                    success: false,
                    message: "Something went wrong while creating the Razorpay order",
                    error,
                });
            }
            else {
                // Prepare the order items from the cart
                const orderItems = cart.products.map((cartProduct) => ({
                    name: cartProduct.product.productId.name,
                    price: cartProduct.price,
                    quantity: cartProduct.quantity,
                    image: cartProduct.product.productId.images[0].url,
                    product: cartProduct.product.productId._id,
                }));
                // Create the new order in the database with the Razorpay order ID
                const newOrder = yield order_model_1.default.create({
                    shippingInfo,
                    user: userId,
                    orderItems,
                    paymentInfo: {
                        method: "Online-Payment",
                        status: "Pending",
                        razorpay_order_id: razorpayOrder.id,
                    },
                    itemsPrice: cart.totalPrice,
                    taxPrice: 0, // Add tax logic if applicable
                    shippingPrice: 0, // Add shipping cost logic if applicable
                    totalPrice: cart.totalPrice,
                    orderStatus: "Processing",
                    isCOD: false, // Since it's an online payment
                    userMessage,
                });
                return res.json({
                    success: true,
                    message: "Razorpay order created successfully",
                    razorpayOrder, // Razorpay order details
                    orderDetails: newOrder, // Newly created order details
                });
            }
        }));
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Order creation failed",
            error,
        });
    }
});
exports.createRazorpayOrderOfCart = createRazorpayOrderOfCart;
exports.paymentVerify = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        // 1. Check if all the necessary data is provided
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return next(new errorHandler_1.ErrorHandler("Missing payment details", 400));
        }
        const secret = process.env.RAZORPAY_SECRET;
        console.log(">>>>>>>>>>> secret", secret);
        //create hmac object
        const hmac = crypto_1.default.createHmac("sha256", secret);
        hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
        const generateSignature = hmac.digest("hex");
        console.log(">>>>>>>>>>> generateSignature", generateSignature);
        // 4. Verify if the signature matches
        const isAuthentic = generateSignature === razorpay_signature;
        console.log(">>>>>>>>>>> authenticated", isAuthentic);
        if (isAuthentic) {
            // Payment is authentic
            const order = yield order_model_1.default.findOne({
                "paymentInfo.razorpay_order_id": razorpay_order_id,
            });
            if (!order) {
                return next(new errorHandler_1.ErrorHandler("Order not found", 404));
            }
            // 5. Save payment info in the database
            yield payment_model_1.default.create({
                order: order._id,
                user: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id,
                amount: order.totalPrice,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            });
            // 6. Update the Order with the payment details
            const updatedOrder = yield order_model_1.default.findOneAndUpdate({ "paymentInfo.razorpay_order_id": razorpay_order_id }, {
                $set: {
                    "paymentInfo.razorpay_payment_id": razorpay_payment_id,
                    "paymentInfo.razorpay_signature": razorpay_signature,
                    "paymentInfo.status": "Success", // Mark payment as successful
                    paidAt: new Date(), // Update payment date to now
                },
            }, { new: true });
            if (!updatedOrder) {
                return next(new errorHandler_1.ErrorHandler("Order not found", 404));
            }
            console.log(">>>>>>>>>>> updatedOrder", updatedOrder);
            // 7. Redirect to the success page with payment reference
            res.status(201).json({
                success: true,
                message: "Payment Verified",
            });
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
exports.newOrder = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id;
    const { shippingInfo, orderItems, itemsPrice, paymentInfo, taxPrice, shippingPrice, totalPrice, userMessage, isCartOrder, } = req.body;
    console.log(">>>>>>>>>>>", orderItems, paymentInfo, totalPrice, userMessage);
    const order = yield order_model_1.default.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        userMessage,
        isCOD: true,
        paidAt: Date.now(),
        user: (_e = req.user) === null || _e === void 0 ? void 0 : _e._id,
    });
    const populatedOrder = yield order.populate("user");
    if (isCartOrder) {
        yield user_model_1.default.updateOne({ _id: userId }, { $push: { myOrders: populatedOrder === null || populatedOrder === void 0 ? void 0 : populatedOrder._id } });
        ///empty the cart
        yield cart_model_1.default.updateOne({ userId }, {
            $set: {
                products: [],
                totalPrice: 0,
            },
        });
    }
    res.status(201).json({
        success: true,
        order: populatedOrder,
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
    var _f;
    const orders = yield order_model_1.default.find({ user: (_f = req.user) === null || _f === void 0 ? void 0 : _f._id }).populate("user");
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

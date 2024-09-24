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
// export const  newOrder = asyncHandler(
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     console.log('>>>>>>>>>>>inside new order controller' )
//     const {
//       shippingInfo,
//       orderItems,
//       itemsPrice,
//       taxPrice,
//       shippingPrice,
//       totalPrice,
//     } = req.body;
//     const keyId: string | null | undefined = process.env.RAZORPAY_ID!;
//     const keySecret: string | null | undefined = process.env.RAZORPAY_SECRET!;
//     try {
//       if (!keyId || !keySecret) {
//         throw new Error(
//           "Razorpay key ID or key secret is not defined in environment variables"
//         );
//       }
//       const razorpay = new Razorpay({
//         key_id: keyId,
//         key_secret: keySecret,
//       });
//       const receiptId = generateReceiptId();
//       const options = {
//         amount: totalPrice * 100,
//         currency: "INR",
//         receipt: receiptId,
//       };
//       const razorpayOrder = await razorpay.orders.create(options);
//       const order = await Order.create({
//         shippingInfo,
//         orderItems,
//         paymentInfo: {
//           razorpay_order_id: razorpayOrder.id,
//         },
//         itemsPrice,
//         taxPrice,
//         shippingPrice,
//         totalPrice,
//         paidAt: Date.now(),
//         user: req.user?._id,
//       });
//       const populatedOrder = await order.populate('user');
//       res.status(201).json({
//         success: true,
//         order: populatedOrder,
//         razorpayOrder,
//       });
//     } catch (error) {
//       console.error("Error creating Razorpay order:", error);
//       res.status(500).json({
//         success: false,
//         message: "Unable to create order. Please try again.",
//       });
//     }
//   }
// );
exports.newOrder = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    const { shippingInfo, orderItems, itemsPrice, paymentInfo, taxPrice, shippingPrice, totalPrice, userMessage } = req.body;
    const order = yield order_model_1.default.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        userMessage,
        paidAt: Date.now(),
        user: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
    });
    const populatedOrder = yield order.populate("user");
    yield user_model_1.default.updateOne({ _id: userId }, { $push: { myOrders: populatedOrder === null || populatedOrder === void 0 ? void 0 : populatedOrder._id } });
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
    });
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
        yield payment_model_1.default.create({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });
        const updatedOrder = yield order_model_1.default.findOneAndUpdate({ "paymentInfo.razorpay_order_id": razorpay_order_id }, { $set: { "paymentInfo.status": "Success" } }, { new: true });
        if (!updatedOrder)
            return next(new errorHandler_1.ErrorHandler("No details provided", 400));
        res.redirect(`http://localhost:3000/products?reference=${razorpay_payment_id}`);
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
    const orders = yield order_model_1.default.find({ user: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id }).populate("user");
    res.status(200).json({
        success: true,
        orders,
    });
}));
// get all Orders -- Admin
exports.getAllOrders = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order_model_1.default.find().populate('shippingInfo', 'user');
    ;
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

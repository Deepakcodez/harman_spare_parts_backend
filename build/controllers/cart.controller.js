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
exports.removeProductToCart = exports.cart = exports.addProductToCart = void 0;
const product_model_1 = __importDefault(require("../model/product.model"));
const cart_model_1 = __importDefault(require("../model/cart.model"));
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const errorHandler_1 = require("../utils/errorHandler");
const user_model_1 = __importDefault(require("../model/user.model"));
// Add product to cart
exports.addProductToCart = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { productId } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    let quantity = 1;
    if (!productId) {
        return next(new errorHandler_1.ErrorHandler("ProductId not provided", 404));
    }
    let user = yield user_model_1.default.findById(userId).populate("cart");
    if (!user) {
        return next(new errorHandler_1.ErrorHandler("User not found", 404));
    }
    // Find product by id
    const product = yield product_model_1.default.findById(productId);
    if (!product) {
        return next(new errorHandler_1.ErrorHandler("Product not found", 404));
    }
    // Check if the user already has a cart
    let cart = yield cart_model_1.default.findById(user.cart);
    if (!cart) {
        // If no cart exists, create a new one
        cart = new cart_model_1.default({ user: userId, products: [], totalPrice: 0 });
        user.cart = cart._id;
        yield user.save();
    }
    // Check if the product already exists in the cart
    const productIndex = cart.products.findIndex((p) => p.productId.equals(productId));
    if (productIndex > -1) {
        // If the product exists, remove it from the cart
        cart.products.splice(productIndex, 1);
    }
    else {
        cart.products.push({
            productId: productId,
            quantity: quantity,
            price: product.price,
        });
    }
    // Update the total price
    cart.totalPrice = cart.products.reduce((total, item) => total + item.price * item.quantity, 0);
    // Save the cart
    yield cart.save();
    // Populate the products in the cart
    yield cart.populate("products.productId");
    res.status(200).json({ success: true, cart });
}));
//get cart
exports.cart = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    let user = yield user_model_1.default.findById(userId).populate("cart");
    if (!user) {
        return next(new errorHandler_1.ErrorHandler("User not found", 404));
    }
    // Check if the user already has a cart
    let cart = yield cart_model_1.default.findById(user.cart).populate("products.productId");
    if (!cart) {
        return next(new errorHandler_1.ErrorHandler("Cart data not found", 404));
    }
    res.status(200).json({ success: true, cart });
}));
//remove prod from cart
exports.removeProductToCart = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { productId } = req.body;
    const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c._id;
    let quantity = 1;
    if (!productId) {
        return next(new errorHandler_1.ErrorHandler("ProductId not provided", 404));
    }
    let user = yield user_model_1.default.findById(userId).populate("cart");
    if (!user) {
        return next(new errorHandler_1.ErrorHandler("User not found", 404));
    }
    // Find product by id
    const product = yield product_model_1.default.findById(productId);
    if (!product) {
        return next(new errorHandler_1.ErrorHandler("Product not found", 404));
    }
    // Check if the user already has a cart
    let cart = yield cart_model_1.default.findById(user.cart);
    if (!cart) {
        return next(new errorHandler_1.ErrorHandler("cart not found", 404));
    }
    // Remove the product from the cart
    cart.products = cart.products.filter((p) => p.productId.toString() !== productId.toString());
    // Save the updated cart
    yield cart.save();
    // Populate the products in the cart
    yield cart.populate("products.productId");
    res.status(200).json({ success: true, cart });
}));

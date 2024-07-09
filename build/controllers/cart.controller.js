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
exports.addProductToCart = void 0;
const product_model_1 = __importDefault(require("../model/product.model"));
const cart_model_1 = __importDefault(require("../model/cart.model"));
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const errorHandler_1 = require("../utils/errorHandler");
// Add product to cart
exports.addProductToCart = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { productId, quantity, cartId } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    if (!quantity) {
        let quantity = 1;
    }
    if (!productId) {
        return next(new errorHandler_1.ErrorHandler("ProductId not provided", 404));
    }
    let cart = yield cart_model_1.default.findOne({ _id: cartId });
    // If cart does not exist, create a new cart
    if (!cart) {
        cart = new cart_model_1.default({
            userId,
            products: [],
            totalPrice: 0,
        });
    }
    //find product by id
    const product = yield product_model_1.default.findById(productId);
    if (!product) {
        return next(new errorHandler_1.ErrorHandler("Product not found", 404));
    }
    // Check if the product already exists in the cart
    const cartProduct = cart.products.find(p => p.productId.equals(productId));
    if (cartProduct) {
        cartProduct.quantity += quantity;
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
    yield cart.populate('products.productId');
    // Save the cart ID in cookies
    res.cookie('cart', cart._id.toString(), {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    res.status(200).json({ success: true, cart });
}));

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
// Add product to cart
const addProductToCart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { productId, quantity } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    try {
        // Find the product
        const product = yield product_model_1.default.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Find the cart by user ID
        let cart = yield cart_model_1.default.findOne({ userId });
        // If cart doesn't exist, create a new one
        if (!cart) {
            cart = new cart_model_1.default({ userId, products: [], totalPrice: 0 });
        }
        // Check if the product already exists in the cart
        const productIndex = cart.products.findIndex((p) => p.productId.toString() === productId);
        if (productIndex > -1) {
            // If product exists, update the quantity
            cart.products[productIndex].quantity += quantity;
        }
        else {
            // If product doesn't exist, add it to the cart
            cart.products.push({
                productId: productId,
                quantity,
                price: product.price,
                name: product.name,
            });
        }
        // Recalculate the total price
        cart.totalPrice = cart.products.reduce((total, item) => total + item.price * item.quantity, 0);
        // Save the cart
        yield cart.save();
        res.status(200).json(cart);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.addProductToCart = addProductToCart;

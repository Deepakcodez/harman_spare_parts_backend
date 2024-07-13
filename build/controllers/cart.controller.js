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
exports.getCart = exports.addProductToCart = void 0;
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
    const quantity = 1;
    if (!productId) {
        return next(new errorHandler_1.ErrorHandler("ProductId not provided", 404));
    }
    const user = yield user_model_1.default.findById(userId).populate("cart");
    if (!user) {
        return next(new errorHandler_1.ErrorHandler("User not found", 404));
    }
    // Find product by id
    const product = yield product_model_1.default.findById(productId);
    if (!product) {
        return next(new errorHandler_1.ErrorHandler("Product not found", 404));
    }
    // Check if the user already has a cart
    let cart = yield cart_model_1.default.findOne({ userId: userId });
    if (!cart) {
        // If no cart exists, create a new one
        cart = new cart_model_1.default({ userId: userId, products: [], totalPrice: 0 });
        user.cart = cart._id;
        yield user.save();
    }
    // Check if the product already exists in the cart
    const productIndex = cart.products.findIndex((p) => p.product.productId.equals(productId));
    if (productIndex > -1) {
        // If the product exists, update the quantity
        cart.products[productIndex].product.prodQuantity += quantity;
    }
    else {
        cart.products.push({
            product: {
                productId: productId,
                prodQuantity: quantity
            },
            quantity: quantity,
            price: product.price,
        });
    }
    // Update the total price
    cart.totalPrice = cart.products.reduce((total, item) => total + item.price * item.quantity, 0);
    // Save the cart
    yield cart.save();
    // Populate the products in the cart
    yield cart.populate("products.product.productId");
    res.status(200).json({ success: true, cart });
}));
exports.getCart = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    if (!userId) {
        return next(new errorHandler_1.ErrorHandler("User not authenticated", 401));
    }
    const user = yield user_model_1.default.findById(userId);
    if (!user) {
        return next(new errorHandler_1.ErrorHandler("User not found", 404));
    }
    // Check if the user already has a cart
    let cart = yield cart_model_1.default.findOne({ userId }).populate("products.product.productId");
    if (!cart) {
        return next(new errorHandler_1.ErrorHandler("Cart not found", 404));
    }
    res.status(200).json({ success: true, cart });
}));
// //remove prod from cart
// export const removeProductToCart = asyncHandler(
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     const { productId } = req.body;
//     const userId = req.user?._id;
//     let quantity = 1;
//     if (!productId) {
//       return next(new ErrorHandler("ProductId not provided", 404));
//     }
//     let user = await User.findById(userId).populate("cart");
//     if (!user) {
//       return next(new ErrorHandler("User not found", 404));
//     }
//     // Find product by id
//     const product = await Product.findById(productId);
//     if (!product) {
//       return next(new ErrorHandler("Product not found", 404));
//     }
//     // Check if the user already has a cart
//     let cart = await Cart.findById(user.cart);
//     if (!cart) {
//       return next(new ErrorHandler("cart not found", 404));
//     }
//     // Remove the product from the cart
//     cart.products = cart.products.filter(
//       (p) => p.productId.toString() !== productId.toString()
//     );
//     // Save the updated cart
//     await cart.save();
//     // Populate the products in the cart
//     await cart.populate("products.productId");
//     res.status(200).json({ success: true, cart });
//   }
// );

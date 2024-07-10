import { Request, Response, NextFunction } from "express";
import Product from "../model/product.model";
import Cart from "../model/cart.model";
import asyncHandler from "../middleware/asyncHandler";
import { ErrorHandler } from "../utils/errorHandler";
import User from "../model/user.model";

// Add product to cart
export const addProductToCart = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { productId } = req.body;
    const userId = req.user?._id;
    let quantity = 1;

    if (!productId) {
      return next(new ErrorHandler("ProductId not provided", 404));
    }

    let user = await User.findById(userId).populate('cart');

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    // Find product by id
    const product = await Product.findById(productId);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // Check if the user already has a cart
    let cart = await Cart.findById(user.cart);

    if (!cart) {
      // If no cart exists, create a new one
      cart = new Cart({ user: userId, products: [], totalPrice: 0 });
      user.cart = cart._id;
      await user.save();
    }

    // Check if the product already exists in the cart
    const cartProduct = cart.products.find(p => p.productId.equals(productId));

    if (cartProduct) {
      cartProduct.quantity += quantity;
    } else {
      cart.products.push({
        productId: productId,
        quantity: quantity,
        price: product.price,
      });
    }

    // Update the total price
    cart.totalPrice = cart.products.reduce((total, item) => total + item.price * item.quantity, 0);

    // Save the cart
    await cart.save();

    // Populate the products in the cart
    await cart.populate('products.productId');

   

    res.status(200).json({ success: true });
  }
);
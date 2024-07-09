import { Request, Response, NextFunction } from "express";
import Product from "../model/product.model";
import Cart, { CartDocument } from "../model/cart.model";
import asyncHandler from "../middleware/asyncHandler";
import { ErrorHandler } from "../utils/errorHandler";

// Add product to cart
export const addProductToCart = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { productId, quantity, cartId } = req.body;
    const userId = req.user?._id;

    if(!quantity){
      let quantity = 1;
    }

    if (!productId) {
      return next(new ErrorHandler("ProductId not provided", 404));
    }

    let cart = await Cart.findOne({ _id : cartId });

    // If cart does not exist, create a new cart
    if (!cart) {
      cart = new Cart({
        userId,
        products: [],
        totalPrice: 0,
      });
    }

    //find product by id
    const product = await Product.findById(productId);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
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

     // Save the cart ID in cookies
    res.cookie('cart', cart._id.toString(), {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });


    res.status(200).json({ success: true, cart });


  }
);

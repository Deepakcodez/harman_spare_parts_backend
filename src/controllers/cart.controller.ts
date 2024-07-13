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
      const quantity = 1;
  
      if (!productId) {
        return next(new ErrorHandler("ProductId not provided", 404));
      }
  
      const user = await User.findById(userId).populate("cart");
  
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
  
      // Find product by id
      const product = await Product.findById(productId);
  
      if (!product) {
        return next(new ErrorHandler("Product not found", 404));
      }
  
      // Check if the user already has a cart
      let cart = await Cart.findOne({ userId: userId });
  
      if (!cart) {
        // If no cart exists, create a new one
        cart = new Cart({ userId: userId, products: [], totalPrice: 0 });
        user.cart = cart._id;
        await user.save();
      }
  
      // Check if the product already exists in the cart
      const productIndex = cart.products.findIndex((p) =>
        p.product.productId.equals(productId)
      );
  
      if (productIndex > -1) {
        // If the product exists, update the quantity
        cart.products[productIndex].product.prodQuantity += quantity;
      } else {
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
      cart.totalPrice = cart.products.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
  
      // Save the cart
      await cart.save();
  
      // Populate the products in the cart
      await cart.populate("products.product.productId");
  
      res.status(200).json({ success: true, cart });
    }
  );

  export const getCart = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const userId = req.user?._id;
  
      if (!userId) {
        return next(new ErrorHandler("User not authenticated", 401));
      }
  
      const user = await User.findById(userId);
  
      if (!user) {
        return next(new ErrorHandler("User not found", 404));
      }
  
      // Check if the user already has a cart
      let cart = await Cart.findOne({ userId }).populate("products.product.productId");
  
      if (!cart) {
        return next(new ErrorHandler("Cart not found", 404));
      }
  
      res.status(200).json({ success: true, cart });
    }
  );

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

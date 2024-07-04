import { Request, Response, NextFunction } from 'express';
import Product from '../model/product.model';
import Cart from '../model/cart.model';


// Add product to cart
export const addProductToCart = async (req: Request, res: Response) => {
    const {  productId, quantity } = req.body;
   const userId = req.user?._id;
    try {
      // Find the product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  
      // Find the cart by user ID
      let cart = await Cart.findOne({ userId });
  
      // If cart doesn't exist, create a new one
      if (!cart) {
        cart = new Cart({ userId, products: [], totalPrice: 0 });
      }
  
      // Check if the product already exists in the cart
      const productIndex = cart.products.findIndex((p) => p.productId.toString() === productId);
  
      if (productIndex > -1) {
        // If product exists, update the quantity
        cart.products[productIndex].quantity += quantity;
      } else {
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
      await cart.save();
  
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  
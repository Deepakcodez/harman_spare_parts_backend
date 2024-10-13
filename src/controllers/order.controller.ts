import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middleware/asyncHandler";
import Order, { OrderDocument } from "../model/order.model";
import { ErrorHandler } from "../utils/errorHandler";
import Product, { ProdDocument } from "../model/product.model";
import Razorpay from "razorpay";
import crypto from "crypto";
import { IRazorpayOrderOptions } from "../types/type";
import ShippingInfo, {
  ShippingInfoDocument,
} from "../model/shippingInfo.model";
import Payment from "../model/payment.model";
import User from "../model/user.model";
import Cart from "../model/cart.model";
import orders from "razorpay/dist/types/orders";
import { createRazorpayInstance } from "../utils/razorpay.config";
import mongoose from "mongoose";
const keyId: string | null | undefined = process.env.RAZORPAY_ID!;
const keySecret: string | null | undefined = process.env.RAZORPAY_SECRET!;

// Function to generate a random receipt ID
const generateReceiptId = (): string => {
  return crypto.randomBytes(16).toString("hex");
};

export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { productId, shippingInfo, userMessage } = req.body;

    const userId = req.user?._id;

    // Find the product by productId from the database
    const product = await Product.findById(productId);

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

    const razorpayInstance = createRazorpayInstance();

    // Create the Razorpay order
    razorpayInstance.orders.create(options, async (error, razorpayOrder) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: "Something went wrong while creating the Razorpay order",
          error,
        });
      } else {
        // Create the new order in the database with the Razorpay order ID
        const newOrder = await Order.create({
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
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Order creation failed",
      error,
    });
  }
};

export const createRazorpayOrderOfCart = async (
  req: Request,
  res: Response
) => {
  try {
    const { cartId, shippingInfo, userMessage } = req.body;
    const userId = req.user?._id; // Assuming req.user is populated with user details via middleware

    // Find the cart by cartId
    const cart = await Cart.findById(cartId).populate(
      "products.product.productId"
    );

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

    const razorpayInstance = createRazorpayInstance();

    // Create the Razorpay order
    razorpayInstance.orders.create(options, async (error, razorpayOrder) => {
      if (error) {
        return res.status(500).json({
          success: false,
          message: "Something went wrong while creating the Razorpay order",
          error,
        });
      } else {
        // Prepare the order items from the cart
        const orderItems = cart.products.map((cartProduct: any) => ({
          name: cartProduct.product.productId.name,
          price: cartProduct.price,
          quantity: cartProduct.quantity,
          image: cartProduct.product.productId.images[0].url,
          product: cartProduct.product.productId._id,
        }));

        // Create the new order in the database with the Razorpay order ID
        const newOrder = await Order.create({
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
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Order creation failed",
      error,
    });
  }
};

export const paymentVerify = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

      // 1. Check if all the necessary data is provided
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return next(new ErrorHandler("Missing payment details", 400));
      }

      const secret = process.env.RAZORPAY_SECRET!;
      console.log(">>>>>>>>>>> secret", secret);

      //create hmac object
      const hmac = crypto.createHmac("sha256", secret);

      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);

      const generateSignature = hmac.digest("hex");

      console.log(">>>>>>>>>>> generateSignature", generateSignature);

      // 4. Verify if the signature matches
      const isAuthentic = generateSignature === razorpay_signature;

      console.log(">>>>>>>>>>> authenticated", isAuthentic);

      if (isAuthentic) {
        // Payment is authentic
        const order = await Order.findOne({
          "paymentInfo.razorpay_order_id": razorpay_order_id,
        });

        if (!order) {
          return next(new ErrorHandler("Order not found", 404));
        }

        // 5. Save payment info in the database
        await Payment.create({
          order: order._id,
          user: req.user?._id,
          amount: order.totalPrice,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        });

        // 6. Update the Order with the payment details
        const updatedOrder = await Order.findOneAndUpdate(
          { "paymentInfo.razorpay_order_id": razorpay_order_id },
          {
            $set: {
              "paymentInfo.razorpay_payment_id": razorpay_payment_id,
              "paymentInfo.razorpay_signature": razorpay_signature,
              "paymentInfo.status": "Success", // Mark payment as successful
              paidAt: new Date(), // Update payment date to now
            },
          },
          { new: true }
        );

        if (!updatedOrder) {
          return next(new ErrorHandler("Order not found", 404));
        }

        console.log(">>>>>>>>>>> updatedOrder", updatedOrder);

        // 7. Redirect to the success page with payment reference
        res.status(201).json({
          success: true,
          message: "Payment Verified",
        });
      } else {
        // Signature mismatch
        res.status(400).json({
          success: false,
          message: "Payment verification failed",
        });
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      next(new ErrorHandler("Internal server error", 500));
    }
  }
);

export const newOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?._id;
    const {
      shippingInfo,
      orderItems,
      itemsPrice,
      paymentInfo,
      taxPrice,
      shippingPrice,
      totalPrice,
      userMessage,
      isCartOrder,
    } = req.body;

    console.log(
      ">>>>>>>>>>>",
      orderItems,
      paymentInfo,
      totalPrice,
      userMessage
    );

    const order = await Order.create({
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
      user: req.user?._id,
    });
    const populatedOrder = await order.populate("user");

    if (isCartOrder) {
      await User.updateOne(
        { _id: userId },
        { $push: { myOrders: populatedOrder?._id } }
      );
      ///empty the cart
      await Cart.updateOne(
        { userId },
        {
          $set: {
            products: [],
            totalPrice: 0,
          },
        }
      );
    }

    res.status(201).json({
      success: true,
      order: populatedOrder,
    });
  }
);

// get Single Order
export const getSingleOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const order: OrderDocument | null = await Order.findById(
      req.params.id
    ).populate("user", "name email");

    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }

    res.status(200).json({
      success: true,
      order,
    });
  }
);

// get logged in user  Orders
export const myOrders = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const orders = await Order.find({ user: req.user?._id }).populate("user");

    res.status(200).json({
      success: true,
      orders,
    });
  }
);

// get all Orders -- Admin
export const getAllOrders = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const orders = await Order.find().populate("shippingInfo user");

    let totalAmount: number = 0;

    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });

    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  }
);

// delete Order -- Admin
export const deleteOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const order: OrderDocument | null = await Order.findByIdAndDelete(
      req.params.id
    );

    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }

    res.status(200).json({
      success: true,
      message: "Order removed",
      order,
    });
  }
);

// update Order Status -- Admin

export const updateOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { orderId, paymentStatus, orderStatus } = req.body;

    const order: OrderDocument | null = await Order.findById(orderId);

    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }

    if (order.orderStatus === "Delivered") {
      return next(
        new ErrorHandler("You have already delivered this order", 400)
      );
    }

    if (orderStatus === "Delivered") {
      order.orderItems.forEach(async (o) => {
        await updateStock(o.product.toString(), o.quantity);
      });
    }
    order.orderStatus = orderStatus;
    order.paymentInfo.status = paymentStatus;

    if (orderStatus === "Delivered") {
      order.deliveredAt = new Date();
    }

    await order.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: "Order updated",
    });
  }
);

async function updateStock(id: string, quantity: number): Promise<void> {
  const product: ProdDocument | null = await Product.findById(id);

  if (product) {
    product.stock -= quantity;
    await product.save({ validateBeforeSave: false });
  } else {
    throw new ErrorHandler("Product not found", 404);
  }
}

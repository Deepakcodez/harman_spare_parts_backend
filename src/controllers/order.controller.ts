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
const keyId: string | null | undefined = process.env.RAZORPAY_ID!;
const keySecret: string | null | undefined = process.env.RAZORPAY_SECRET!;

// Function to generate a random receipt ID
const generateReceiptId = (): string => {
  return crypto.randomBytes(16).toString("hex");
};

// Create new Order
export const newOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {
      shippingInfo,
      orderItems,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      userMessage,
      paymentInfo,
    } = req.body;
    const userId = req.user?._id;
    const paymentMethod = paymentInfo.method;

    console.log(">>>>>>>>>>>inside new order controller",paymentMethod);
    const keyId: string | null | undefined = process.env.RAZORPAY_ID!;
    const keySecret: string | null | undefined = process.env.RAZORPAY_SECRET!;

    try {
      let paymentInfo = {};

      // Check if payment method is Online Payment and handle Razorpay order creation
      if (paymentMethod === "online") {
        if (!keyId || !keySecret) {
          throw new Error(
            "Razorpay key ID or key secret is not defined in environment variables"
          );
        }

        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const receiptId = generateReceiptId(); // Generate unique receipt ID

        const options = {
          amount: totalPrice * 100, // Amount in paisa (₹1 = 100 paise)
          currency: "INR",
          receipt: receiptId,
        };

        // Create the Razorpay order
        const razorpayOrder = await razorpay.orders.create(options);

        paymentInfo = {
          razorpay_order_id: razorpayOrder.id,
          method: "online",
          status: "Pending", // Initially pending until the payment is confirmed
        };

        // Create the order in the database
        const order = await Order.create({
          shippingInfo,
          orderItems,
          paymentInfo,
          itemsPrice,
          taxPrice,
          userMessage,
          shippingPrice,
          totalPrice,
          paidAt: Date.now(), // Razorpay doesn't confirm payment instantly
          user: req.user?._id,
        });

        const populatedOrder = await order.populate("user");

        res.status(201).json({
          success: true,
          order: populatedOrder,
          razorpayOrder, // Send back Razorpay order details
        });
      } else if (paymentMethod === "cod") {
        // If payment method is COD, place the order without Razorpay
        paymentInfo = {
          method: "Cash-On-Delivery",
          status: "Pending", // Status is pending for COD orders
        };

        const order = await Order.create({
          shippingInfo,
          orderItems,
          paymentInfo,
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
          userMessage,
          paidAt: null, // Will be null since it's not paid yet (COD)
          user: req.user?._id,
        });

        const populatedOrder = await order.populate("user");

        await User.updateOne(
          { _id: req.user?._id },
          { $push: { myOrders: populatedOrder?._id } }
        );
        //empty the cart
        await Cart.updateOne(
          { userId },
          {
            $set: {
              products: [],
              totalPrice: 0,
            },
          }
        );

        res.status(201).json({
          success: true,
          order: populatedOrder,
          message: "Order placed with Cash on Delivery",
        });
      } else {
        // If payment method is invalid, return an error
        res.status(400).json({
          success: false,
          message: "Invalid payment method",
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({
        success: false,
        message: "Unable to create order. Please try again.",
      });
    }
  }
);

// export const newOrder = asyncHandler(
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     const userId = req.user?._id;
//     const {
//       shippingInfo,
//       orderItems,
//       itemsPrice,
//       paymentInfo,
//       taxPrice,
//       shippingPrice,
//       totalPrice,
//       userMessagehttp://localhost:3000/
//     } = req.body;

//     const order = await Order.create({
//       shippingInfo,
//       orderItems,
//       paymentInfo,
//       itemsPrice,
//       taxPrice,
//       shippingPrice,
//       totalPrice,
//       userMessage,
//       paidAt: Date.now(),
//       user: req.user?._id,
//     });
//     const populatedOrder = await order.populate("user");

//     await User.updateOne(
//       { _id: userId },
//       { $push: { myOrders: populatedOrder?._id } }
//     );
//     //empty the cart
//     await Cart.updateOne({userId}, {
//       $set: {
//         products: [],
//         totalPrice: 0,
//       },
//     });

//     res.status(201).json({
//       success: true,
//       order: populatedOrder,
//     });
//   }
// );
export const paymentVerify = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;

      // 1. Check if all the necessary data is provided
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return next(new ErrorHandler("Missing payment details", 400));
      }

      // 2. Create body string to verify signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;

      // 3. Generate expected signature using HMAC SHA256
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET!)
        .update(body)
        .digest("hex");

      // 4. Verify if the signature matches
      const isAuthentic = expectedSignature === razorpay_signature;

      if (isAuthentic) {
        // Payment is authentic

        // 5. Save payment info in the database
        await Payment.create({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        });

        // 6. Update the order with success status
        const updatedOrder = await Order.findOneAndUpdate(
          { "paymentInfo.razorpay_order_id": razorpay_order_id },
          { $set: { "paymentInfo.status": "Success" } },
          { new: true }
        );

        if (!updatedOrder) {
          return next(new ErrorHandler("Order not found", 404));
        }

        // 7. Redirect to the success page with payment reference
        res.redirect(
          `http://localhost:3000/products?reference=${razorpay_payment_id}`
        );
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

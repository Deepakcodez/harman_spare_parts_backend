import { Request, Response, NextFunction } from "express";
import asyncHandler from "../middleware/asyncHandler";
import Order, { OrderDocument } from "../model/order.model";
import { ErrorHandler } from "../utils/errorHandler";
import Product, { ProdDocument } from "../model/product.model";
import Razorpay from "razorpay";
import crypto from "crypto";
import { IRazorpayOrderOptions } from "../types/type";
import ShippingInfo, { ShippingInfoDocument } from '../model/shippingInfo.model';
const keyId: string | null | undefined = process.env.RAZORPAY_ID!;
const keySecret: string | null | undefined = process.env.RAZORPAY_SECRET!;

// Function to generate a random receipt ID
const generateReceiptId = (): string => {
  return crypto.randomBytes(16).toString("hex");
};




// //shipping address
export const shippingAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { address, city, state, country, pinCode, phoneNo} = req.body;
    const userId = req.user?.id;

    const shippingDetail: ShippingInfoDocument ={
        address,
        city,
        state,
        country,
        pinCode,
        phoneNo,
        user : userId
    }
    try {
      
       if(! address || !city || !state || !country || !pinCode || !phoneNo){
          return next(new ErrorHandler("Provide all details", 404));
       }

       const shipping = await  ShippingInfo.findOne({user : userId} )

       if (shipping) {
        // Update existing shipping address
        shipping.address = address;
        shipping.city = city;
        shipping.state = state;
        shipping.country = country;
        shipping.pinCode = pinCode;
        shipping.phoneNo = phoneNo;
        await shipping.save();
      } else {
        // Create new shipping address
        await ShippingInfo.create(shippingDetail);
      }

      res.status(200).json({
        success: true,
        message: shipping ? "Shipping address updated successfully" : "Shipping address created successfully",
      });

    } catch (error) {
      console.error("Error in saving shipping info:", error);
      res.status(500).json({
        success: false,
        message: "Unable to save shipping info. Please try again.",
      });
    }

     
  }
);



// Create new Order
export const newOrder = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    try {
      if (!keyId || !keySecret) {
        throw new Error(
          "Razorpay key ID or key secret is not defined in environment variables"
        );
      }

      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const receiptId = generateReceiptId();

      const options = {
        amount: totalPrice * 100, 
        currency: "INR",
        receipt: receiptId,
      };

      const razorpayOrder = await razorpay.orders.create(options);

      const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo: {
          ...paymentInfo,
          razorpay_order_id: razorpayOrder.id,
        },
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user?._id,
      });

      const populatedOrder = await order.populate('user');


      res.status(201).json({
        success: true,
        order: populatedOrder,
        razorpayOrder,
      });
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({
        success: false,
        message: "Unable to create order. Please try again.",
      });
    }
  }
);


export const paymentVerify = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET!)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Database comes here

    // await Payment.create({
    //   razorpay_order_id,
    //   razorpay_payment_id,
    //   razorpay_signature,
    // });

    res.redirect(
      `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
    );
  } else {
    res.status(400).json({
      success: false,
    });
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
    const orders = await Order.find({ user: req.user?._id }).populate('user');

    res.status(200).json({
      success: true,
      orders,
    });
  }
);

// get all Orders -- Admin
export const getAllOrders = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const orders = await Order.find();

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
    const order: OrderDocument | null = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }

    if (order.orderStatus === "Delivered") {
      return next(
        new ErrorHandler("You have already delivered this order", 400)
      );
    }

    if (req.body.status === "Shipped") {
      order.orderItems.forEach(async (o) => {
        await updateStock(o.product.toString(), o.quantity);
      });
    }
    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
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

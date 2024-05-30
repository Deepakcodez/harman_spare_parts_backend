import { Request, Response, NextFunction } from 'express';
import asyncHandler from "../middleware/asyncHandler";
import Order from '../model/order.model';


// Create new Order
export const newOrder = asyncHandler(async (req :Request, res:Response, next:NextFunction) => {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;
  
    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user?._id,
    });
  
    res.status(201).json({
      success: true,
      order,
    });
  });
  
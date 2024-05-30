import { Request, Response, NextFunction } from 'express';
import asyncHandler from "../middleware/asyncHandler";
import Order from '../model/order.model';
import { ErrorHandler } from '../utils/errorHandler';


// Create new Order
export const newOrder = asyncHandler(async (req :Request, res:Response, next:NextFunction):Promise<void> => {
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
  

  // get Single Order
export const getSingleOrder = asyncHandler(async (req:Request, res:Response, next:NextFunction):Promise<void> => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
  
    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }
  
    res.status(200).json({
      success: true,
      order,
    });
  });
  


  // get logged in user  Orders
  export const myOrders = asyncHandler(async (req:Request, res:Response, next:NextFunction):Promise<void> => {
    const orders = await Order.find({ user: req.user?._id });
    

  
    res.status(200).json({
      success: true,
      orders,
    });
  });
  


  
// get all Orders -- Admin
export const getAllOrders = asyncHandler(async (req:Request, res:Response, next:NextFunction):Promise<void> => {
    const orders = await Order.find();
  
    let totalAmount:number = 0;
  
    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });
  
    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  });
  

  
// delete Order -- Admin
export const deleteOrder =  asyncHandler(async (req:Request, res:Response, next:NextFunction):Promise<void> => {
    const order = await Order.findByIdAndDelete(req.params.id);
  
    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }
  
  
    res.status(200).json({
      success: true,
      message : "Order removed",
      order
    });
  });
import { Request, Response, NextFunction } from 'express';
import asyncHandler from "../middleware/asyncHandler";
import Order, { OrderDocument } from '../model/order.model';
import { ErrorHandler } from '../utils/errorHandler';
import Product, { ProdDocument } from '../model/product.model';


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
    const order:OrderDocument| null = await Order.findById(req.params.id).populate(
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
    const order:OrderDocument| null = await Order.findByIdAndDelete(req.params.id);
  
    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }
  
  
    res.status(200).json({
      success: true,
      message : "Order removed",
      order
    });
  });



// update Order Status -- Admin

  export const updateOrder =  asyncHandler(async (req:Request, res:Response, next:NextFunction):Promise<void> => {
    const order:OrderDocument| null = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order not found with this Id", 404));
    }
  
    if (order.orderStatus === "Delivered") {
      return next(new ErrorHandler("You have already delivered this order", 400));
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
      message : "Order updated",
      
    });
  });



  async function updateStock(id: string, quantity: number): Promise<void> {
    const product: ProdDocument | null = await Product.findById(id);

    if (product) {
        product.stock -= quantity;
        await product.save({ validateBeforeSave: false });
    } else {
        throw new ErrorHandler("Product not found", 404);
    }
}



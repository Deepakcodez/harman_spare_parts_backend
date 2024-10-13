import express from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { authorizedRole, isAuthenticatedUser } from '../middleware/auth';
import { newOrder,getSingleOrder, myOrders, getAllOrders,deleteOrder, updateOrder, paymentVerify, createRazorpayOrder, createRazorpayOrderOfCart, } from '../controllers/order.controller';

const router = express.Router();

router.post('/create', isAuthenticatedUser, newOrder); 
router.post('/paymentVerify', isAuthenticatedUser, paymentVerify); 
router.post('/razorpayorder',isAuthenticatedUser,  createRazorpayOrder); 
router.post('/cart/razorpayorder',isAuthenticatedUser,  createRazorpayOrderOfCart); 
router.get('/singleOrder/:id', isAuthenticatedUser, getSingleOrder);
router.get('/myOrders', isAuthenticatedUser, myOrders);
router.get('/admin/all/orders', isAuthenticatedUser,authorizedRole("admin"), getAllOrders);
router.delete('/admin/remove/:id', isAuthenticatedUser,authorizedRole("admin"), deleteOrder);
router.put('/admin/update/status/', isAuthenticatedUser,authorizedRole("admin"), updateOrder);

export default router;

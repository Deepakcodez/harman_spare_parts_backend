import express from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { authorizedRole, isAuthenticatedUser } from '../middleware/auth';
import { newOrder,getSingleOrder, myOrders } from '../controllers/order.controller';

const router = express.Router();

router.post('/create', isAuthenticatedUser, newOrder);
router.get('/singleOrder/:id', isAuthenticatedUser, getSingleOrder);
router.get('/myOrders', isAuthenticatedUser, myOrders);

export default router;

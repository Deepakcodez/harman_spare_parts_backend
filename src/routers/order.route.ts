import express from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { authorizedRole, isAuthenticatedUser } from '../middleware/auth';
import { newOrder } from '../controllers/order.controller';

const router = express.Router();

router.post('/create', isAuthenticatedUser, asyncHandler(newOrder));

export default router;

import express from 'express';
import { authorizedRole, isAuthenticatedUser } from '../middleware/auth';
import {  shippingAddress, getShippingAddress, getShippingAddressByShippingId } from '../controllers/shipping.controller';

const router = express.Router();

router.put('/shippingInfo', isAuthenticatedUser, shippingAddress); 
router.get('/getShippingInfo', isAuthenticatedUser, getShippingAddress); 
router.get('/getShippingInfo/:id', isAuthenticatedUser, getShippingAddressByShippingId); 


export default router;
    
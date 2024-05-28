import express from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { createProduct, getAllProducts, updateProduct, deleteProduct, getProduct } from '../controllers/product.controller';
import { authorizedRole, isAuthenticatedUser } from '../middleware/auth';

const router = express.Router();

router.post('/admin/create', isAuthenticatedUser, authorizedRole("admin"), asyncHandler(createProduct));
router.get('/allProducts',isAuthenticatedUser, asyncHandler(getAllProducts));
router.put('/admin/update/:id',  isAuthenticatedUser, authorizedRole("admin"), asyncHandler(updateProduct));
router.delete('/admin/delete/:id',  isAuthenticatedUser, authorizedRole("admin") ,asyncHandler(deleteProduct));
router.get('/product/:id', asyncHandler(getProduct));

export default router;

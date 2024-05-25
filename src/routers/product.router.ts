import express from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { createProduct, getAllProducts, updateProduct, deleteProduct, getProduct } from '../controllers/product.controller';

const router = express.Router();

router.post('/create', asyncHandler(createProduct));
router.get('/allProducts', asyncHandler(getAllProducts));
router.put('/update/:id', asyncHandler(updateProduct));
router.delete('/delete/:id', asyncHandler(deleteProduct));
router.get('/product/:id', asyncHandler(getProduct));

export default router;

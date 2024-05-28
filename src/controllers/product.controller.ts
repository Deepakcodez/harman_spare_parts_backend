import { NextFunction, Request, Response } from 'express';
import Product from '../model/product.model';
import { ErrorHandler } from '../utils/errorHandler';
import { APIfeature } from '../utils/APIfeature';
import asyncHandler from '../middleware/asyncHandler';

// Create a new product
export const createProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  req.body.user = req.user?.id;
  const productDetail = req.body;
  console.log('>>>>>>>>>>>', productDetail);

  if (!productDetail.name || !productDetail.price) {
    return next(new ErrorHandler('Name and price are required', 400));
  }

  const product = await Product.create(productDetail);

  res.status(201).json({
    success: true,
    product,
  });
});

// Get all products
export const getAllProducts = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const resultPerPage: number = 2;

  const productCount = await Product.countDocuments();
  
  const apiFeature = new APIfeature(Product.find(), req.query).search().filter().pagination(resultPerPage);
  
  const products = await apiFeature.query;

  if (products.length === 0) {
    return next(new ErrorHandler('No products found', 404));
  }

  res.status(200).json({
    success: true,
    products,
    productCount,
  });
});
// Update a product
export const updateProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  const productDetail = req.body;

  const product = await Product.findByIdAndUpdate(id, productDetail, { new: true, runValidators: true });

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

// Delete a product
export const deleteProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
});

// Get a single product
export const getProduct = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    return next(new ErrorHandler('Product not found', 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});
import { Request, Response } from 'express';
import Product from '../model/product.model';
import { ErrorHandler } from '../utils/errorHandler';

// Create a new product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const productDetail = req.body;
 console.log('>>>>>>>>>>>',productDetail)
  if (!productDetail.name || !productDetail.price) {
    throw new ErrorHandler('Name and price are required', 400);
  }

  const product = await Product.create(productDetail);
  res.status(201).json({
    success: true,
    product,
  });
};

// Get all products
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  const products = await Product.find();

  if (products.length === 0) {
    throw new ErrorHandler('No products found', 404);
  }

  res.status(200).json({
    success: true,
    products,
  });
};

// Update a product
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const productDetail = req.body;

  const product = await Product.findByIdAndUpdate(id, productDetail, { new: true, runValidators: true });

  if (!product) {
    throw new ErrorHandler('Product not found', 404);
  }

  res.status(200).json({
    success: true,
    product,
  });
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    throw new ErrorHandler('Product not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully',
  });
};

// Get a single product
export const getProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    throw new ErrorHandler('Product not found', 404);
  }

  res.status(200).json({
    success: true,
    product,
  });
};

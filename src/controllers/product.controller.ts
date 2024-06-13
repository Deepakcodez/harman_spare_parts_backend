import { NextFunction, Request, Response } from "express";
import Product, { Review, } from "../model/product.model";
import { ErrorHandler } from "../utils/errorHandler";
import { APIfeature } from "../utils/APIfeature";
import asyncHandler from "../middleware/asyncHandler";
import mongoose from "mongoose";

// Create a new product
export const createProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    req.body.user = req.user?.id;
    const productDetail = req.body;
    console.log(">>>>>>>>>>>", productDetail);

    if (!productDetail.name || !productDetail.price) {
      return next(new ErrorHandler("Name and price are required", 400));
    }

    const product = await Product.create(productDetail);

    res.status(201).json({
      success: true,
      product,
    });
  }
);

// Get all products
export const getAllProducts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const resultPerPage: number = 9;

    const productCount = await Product.countDocuments();

    const apiFeature = new APIfeature(Product.find(), req.query)
      .search()
      .filter()
      .pagination(resultPerPage);

    const products = await apiFeature.query;

    if (products.length === 0) {
      return next(new ErrorHandler("No products found", 404));
    }

    res.status(200).json({
      success: true,
      products,
      productCount,
    });
  }
);
// Update a product
export const updateProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const productDetail = req.body;

    const product = await Product.findByIdAndUpdate(id, productDetail, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
      success: true,
      product,
    });
  }
);

// Delete a product
export const deleteProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  }
);

// Get a single product
export const getProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
      success: true,
      product,
    });
  }
);

//product review
export const createProductReview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { rating, comment, productId } = req.body;

    const review: Review = {
      user: req.user?._id,
      name: req.user?.name,
      rating: Number(rating),
      comment,
    };

    const product = await Product.findById(productId);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    const isReviewed = product.reviews.find(
      (rev) => rev.user?.toString() === req.user?._id.toString()
    );

    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user?.toString() === req.user?._id.toString()) {
          rev.rating = rating;
          rev.comment = comment;
        }
      });
    } else {
      product.reviews.push(review);
      product.numberOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });
    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      product,
    });
  }
);


//get all reviews
export const productAllReview = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
  
    res.status(200).json({
      success: true,
      reviews : product.reviews,
    });
  }
);







//delete review
// export const deleteReview = asyncHandler(
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {

//     const reviewId:string|undefined = req.query.id?.toString();

//     const product = await Product.findById(req.query.id);

//     if (!product) {
//       return next(new ErrorHandler("Product not found", 404));
//     }

//     const reviews = product.reviews.filter(
//       (rev) => (rev._id as mongoose.Types.ObjectId).toString() !== reviewId
//     );

//     let avg = 0;

//     reviews.forEach((rev) => {
//       avg += rev.rating;
//     });

//     let ratings = 0;

//     if (reviews.length === 0) {
//       ratings = 0;
//     } else {
//       ratings = avg / reviews.length;
//     }

//     const numOfReviews = reviews.length;

//     await Product.findByIdAndUpdate(
//       req.query.productId,
//       {
//         reviews,
//         ratings,
//         numOfReviews,
//       },
//       {
//         new: true,
//         runValidators: true,
//         useFindAndModify: false,
//       }
//     );

//     res.status(200).json({
//       success: true,
//       message: 'Review deleted successfully',
//     });
//   }
// );
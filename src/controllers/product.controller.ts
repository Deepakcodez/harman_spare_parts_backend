import { NextFunction, Request, Response } from "express";
import Product, { Review } from "../model/product.model";
import { ErrorHandler } from "../utils/errorHandler";
import { APIfeature } from "../utils/APIfeature";
import asyncHandler from "../middleware/asyncHandler";
import { uploadMultipleToCloudinary } from "../utils/cloudinary";
import { v2 as cloudinary } from "cloudinary";
// import { redis } from "..";


// Create a new product
export const createProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user?.id;
    const { name, description, price,refPrice, stock, category, isFreeDelivery } =
      req.body;

    if (!name || !price) {
      return next(new ErrorHandler("Name and price are required", 400));
    }

    try {

      let images : { public_id: string; url: string }[] = [];

      if (Array.isArray(req.files) && req.files.length > 0) {
        // Upload multiple files to Cloudinary
        const uploadResults = await uploadMultipleToCloudinary(
          (req.files as Express.Multer.File[]).map((file) => file.buffer)
        );

        images = uploadResults.map(result => ({
          public_id: result.public_id,
          url: result.secure_url,
        }));
      }


      const product = await Product.create({
        name,
        description,
        price,
        refPrice,
        stock,
        isFreeDelivery,
        category,
        user: req.user?.id,
        images,
      });

      res.status(201).json({
        success: true,
        product,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all products
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const resultPerPage: number = 15;



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
  return;
};

// Get all products (Admin)
export const getAllProductsAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  const productCount = await Product.countDocuments();
  const products = await Product.find();
  if (products.length === 0) {
    return next(new ErrorHandler("No products found", 404));
  }
  res.status(200).json({
    success: true,
    products,
    productCount,
  });
  return;
};

// Update a product
export const updateProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const productDetail = req.body;
// Fetch the existing product details
const existingProduct = await Product.findById(id);

if (!existingProduct) {
  return next(new ErrorHandler("Product not found", 404));
}

// Merge the existing product data with the new data from the request
const updatedProductDetail = {
  ...existingProduct.toObject(),
  ...productDetail, // Only overwrite fields provided in the body
};

// Now update the product with the merged details
const product = await Product.findByIdAndUpdate(id, updatedProductDetail, {
  new: true,
  runValidators: true,
});


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
    // Find the product by its id
    const product = await Product.findById(id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

     // Delete associated images from Cloudinary
     const deleteImagePromises = product.images.map((image: { public_id: string }) =>
      cloudinary.uploader.destroy(image.public_id)
    );

    // Wait for all image deletions to complete
    await Promise.all(deleteImagePromises);
     await Product.findByIdAndDelete(id);

   

    res.status(200).json({
      success: true,
      message: "Product deleted successfully ",
    });
  }
);

// Get a single product
export const getProduct = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // await redis.set(`product:${id}`, JSON.stringify(product));

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

   // Calculate the average rating
   const totalRating = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
   const avgRating = parseFloat((totalRating / product.reviews.length).toFixed(1));

   // Assign the calculated average rating back to the product's `ratings` field
   product.ratings = avgRating;

   await product.save({ validateBeforeSave: false });
   
    res.status(200).json({
      success: true,
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
      reviews: product.reviews,
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

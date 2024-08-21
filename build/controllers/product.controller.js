"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productAllReview = exports.createProductReview = exports.getProduct = exports.deleteProduct = exports.updateProduct = exports.getAllProducts = exports.createProduct = void 0;
const product_model_1 = __importDefault(require("../model/product.model"));
const errorHandler_1 = require("../utils/errorHandler");
const APIfeature_1 = require("../utils/APIfeature");
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const cloudinary_1 = require("../utils/cloudinary");
const node_cache_1 = __importDefault(require("node-cache"));
// import { redis } from "..";
const nodeCache = new node_cache_1.default();
// Create a new product
exports.createProduct = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const user = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { name, description, price, stock, category, isFreeDelivery } = req.body;
    if (!name || !price) {
        return next(new errorHandler_1.ErrorHandler("Name and price are required", 400));
    }
    try {
        let images = [];
        if (Array.isArray(req.files) && req.files.length > 0) {
            // Upload multiple files to Cloudinary
            const uploadResults = yield (0, cloudinary_1.uploadMultipleToCloudinary)(req.files.map((file) => file.buffer));
            images = uploadResults.map(result => ({
                public_id: result.public_id,
                url: result.secure_url,
            }));
        }
        const product = yield product_model_1.default.create({
            name,
            description,
            price,
            stock,
            isFreeDelivery,
            category,
            user: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
            images,
        });
        res.status(201).json({
            success: true,
            product,
        });
    }
    catch (error) {
        next(error);
    }
}));
// Get all products
const getAllProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const resultPerPage = 15;
    const cacheKey = "cachedProducts";
    // Check if products are in cache
    const cachedProducts = nodeCache.get(cacheKey);
    if (cachedProducts) {
        res.status(200).json({
            success: true,
            message: "from cache",
            products: JSON.parse(cachedProducts),
            productCount: yield product_model_1.default.countDocuments(),
        });
        return;
    }
    const productCount = yield product_model_1.default.countDocuments();
    const apiFeature = new APIfeature_1.APIfeature(product_model_1.default.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);
    const products = yield apiFeature.query;
    if (products.length === 0) {
        return next(new errorHandler_1.ErrorHandler("No products found", 404));
    }
    nodeCache.set(cacheKey, JSON.stringify(products));
    res.status(200).json({
        success: true,
        products,
        productCount,
    });
    return;
});
exports.getAllProducts = getAllProducts;
// Update a product
exports.updateProduct = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const productDetail = req.body;
    const product = yield product_model_1.default.findByIdAndUpdate(id, productDetail, {
        new: true,
        runValidators: true,
    });
    nodeCache.del("cachedProducts");
    if (!product) {
        return next(new errorHandler_1.ErrorHandler("Product not found", 404));
    }
    res.status(200).json({
        success: true,
        product,
    });
}));
// Delete a product
exports.deleteProduct = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const product = yield product_model_1.default.findByIdAndDelete(id);
    nodeCache.del("cachedProducts");
    if (!product) {
        return next(new errorHandler_1.ErrorHandler("Product not found", 404));
    }
    res.status(200).json({
        success: true,
        message: "Product deleted successfully",
    });
}));
// Get a single product
exports.getProduct = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const product = yield product_model_1.default.findById(id);
    if (!product) {
        return next(new errorHandler_1.ErrorHandler("Product not found", 404));
    }
    // await redis.set(`product:${id}`, JSON.stringify(product));
    res.status(200).json({
        success: true,
        product,
    });
}));
//product review
exports.createProductReview = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { rating, comment, productId } = req.body;
    console.log('>>>>>>>>>>> rating', rating);
    const review = {
        user: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id,
        name: (_d = req.user) === null || _d === void 0 ? void 0 : _d.name,
        rating: Number(rating),
        comment,
    };
    const product = yield product_model_1.default.findById(productId);
    if (!product) {
        return next(new errorHandler_1.ErrorHandler("Product not found", 404));
    }
    const isReviewed = product.reviews.find((rev) => { var _a, _b; return ((_a = rev.user) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString()); });
    if (isReviewed) {
        product.reviews.forEach((rev) => {
            var _a, _b;
            if (((_a = rev.user) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString())) {
                rev.rating = rating;
                rev.comment = comment;
            }
        });
    }
    else {
        product.reviews.push(review);
        product.numberOfReviews = product.reviews.length;
    }
    // Calculate the average rating
    const totalRating = product.reviews.reduce((acc, rev) => acc + rev.rating, 0);
    const avgRating = parseFloat((totalRating / product.reviews.length).toFixed(1));
    // Assign the calculated average rating back to the product's `ratings` field
    product.ratings = avgRating;
    yield product.save({ validateBeforeSave: false });
    nodeCache.del("cachedProducts");
    res.status(200).json({
        success: true,
    });
}));
//get all reviews
exports.productAllReview = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_model_1.default.findById(req.params.id);
    if (!product) {
        return next(new errorHandler_1.ErrorHandler("Product not found", 404));
    }
    res.status(200).json({
        success: true,
        reviews: product.reviews,
    });
}));
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

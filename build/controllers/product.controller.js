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
// Create a new product
exports.createProduct = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    req.body.user = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const productDetail = req.body;
    console.log(">>>>>>>>>>>", productDetail);
    if (!productDetail.name || !productDetail.price) {
        return next(new errorHandler_1.ErrorHandler("Name and price are required", 400));
    }
    const product = yield product_model_1.default.create(productDetail);
    res.status(201).json({
        success: true,
        product,
    });
}));
// Get all products
exports.getAllProducts = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const resultPerPage = 9;
    const productCount = yield product_model_1.default.countDocuments();
    const apiFeature = new APIfeature_1.APIfeature(product_model_1.default.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);
    const products = yield apiFeature.query;
    if (products.length === 0) {
        return next(new errorHandler_1.ErrorHandler("No products found", 404));
    }
    res.status(200).json({
        success: true,
        products,
        productCount,
    });
}));
// Update a product
exports.updateProduct = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const productDetail = req.body;
    const product = yield product_model_1.default.findByIdAndUpdate(id, productDetail, {
        new: true,
        runValidators: true,
    });
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
    res.status(200).json({
        success: true,
        product,
    });
}));
//product review
exports.createProductReview = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { rating, comment, productId } = req.body;
    const review = {
        user: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
        name: (_c = req.user) === null || _c === void 0 ? void 0 : _c.name,
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
    let avg = 0;
    product.reviews.forEach((rev) => {
        avg += rev.rating;
    });
    product.ratings = avg / product.reviews.length;
    yield product.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
        product,
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

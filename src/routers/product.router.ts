import express from "express";
import asyncHandler from "../middleware/asyncHandler";
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProduct,
  createProductReview,
  productAllReview,
} from "../controllers/product.controller";
import { authorizedRole, isAuthenticatedUser } from "../middleware/auth";
import { upload } from "../utils/cloudinary";

const router = express.Router();


router.post(
  "/admin/create",
  isAuthenticatedUser,
  upload.single('images'),
  asyncHandler(createProduct)
);
router.get("/allProducts", asyncHandler(getAllProducts));
router.put(
  "/admin/update/:id",
  isAuthenticatedUser,
  authorizedRole("admin"),
  asyncHandler(updateProduct)
);
router.delete(
  "/admin/delete/:id",
  isAuthenticatedUser,
  authorizedRole("admin"),
  asyncHandler(deleteProduct)
);
router.get("/product/:id", asyncHandler(getProduct));
router.put("/create/review", isAuthenticatedUser, createProductReview);
router.get("/reviews/:id", productAllReview);

export default router;

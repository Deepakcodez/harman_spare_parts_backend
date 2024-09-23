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
  getAllProductsAdmin,
} from "../controllers/product.controller";
import { authorizedRole, isAuthenticatedUser } from "../middleware/auth";
import { upload } from "../utils/cloudinary";

const router = express.Router();


router.post(
  "/admin/create",
  isAuthenticatedUser,
  upload.array('images', 5),
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
  "/admin/delete",
  isAuthenticatedUser,
  authorizedRole("admin"),
  asyncHandler(deleteProduct)
);
router.get("/product/:id", asyncHandler(getProduct));
router.put("/create/review", isAuthenticatedUser, createProductReview);
router.get("/reviews/:id", productAllReview);
router.get("/admin/all", isAuthenticatedUser, authorizedRole("admin"), asyncHandler(getAllProductsAdmin));

export default router;

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
import { uploader } from "../middleware/multer";
import path from "path";

const router = express.Router();

router.use(express.static(path.resolve(__dirname, 'public')));

router.post(
  "/admin/create",
  uploader.single("images"),    
  isAuthenticatedUser,
  asyncHandler(createProduct)
);
router.get("/allProducts", getAllProducts);
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

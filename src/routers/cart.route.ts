import express from "express";
import { authorizedRole, isAuthenticatedUser } from "../middleware/auth";
import {
  addProductToCart,
  getCart
} from "../controllers/cart.controller";

const router = express.Router();

router.post("/add", isAuthenticatedUser, addProductToCart);
// router.post("/remove", isAuthenticatedUser, removeProductToCart);
router.get("/details", isAuthenticatedUser, getCart);

export default router;

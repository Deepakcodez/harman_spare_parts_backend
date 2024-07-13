import express from "express";
import { authorizedRole, isAuthenticatedUser } from "../middleware/auth";
import {
  addProductToCart,
  getCart,
  removeProductFromCart
} from "../controllers/cart.controller";

const router = express.Router();

router.post("/add", isAuthenticatedUser, addProductToCart);
router.post("/remove", isAuthenticatedUser, removeProductFromCart);
router.get("/details", isAuthenticatedUser, getCart);

export default router;

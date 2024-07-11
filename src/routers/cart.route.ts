import express from "express";
import { authorizedRole, isAuthenticatedUser } from "../middleware/auth";
import {
  addProductToCart,
  cart,
  removeProductToCart,
} from "../controllers/cart.controller";

const router = express.Router();

router.post("/add", isAuthenticatedUser, addProductToCart);
router.post("/remove", isAuthenticatedUser, removeProductToCart);
router.get("/details", isAuthenticatedUser, cart);

export default router;

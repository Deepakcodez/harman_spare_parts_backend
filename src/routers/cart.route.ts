import express from "express";
import asyncHandler from "../middleware/asyncHandler";
import { authorizedRole, isAuthenticatedUser } from "../middleware/auth";
import { addProductToCart, cart } from "../controllers/cart.controller";

const router = express.Router();

router.post("/add", isAuthenticatedUser, addProductToCart);
router.get("/details", isAuthenticatedUser, cart);

export default router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const cart_controller_1 = require("../controllers/cart.controller");
const router = express_1.default.Router();
router.post("/add", auth_1.isAuthenticatedUser, cart_controller_1.addProductToCart);
router.post("/remove", auth_1.isAuthenticatedUser, cart_controller_1.removeProductFromCart);
router.post("/decrease", auth_1.isAuthenticatedUser, cart_controller_1.removeProductQuantity);
router.get("/details", auth_1.isAuthenticatedUser, cart_controller_1.getCart);
exports.default = router;

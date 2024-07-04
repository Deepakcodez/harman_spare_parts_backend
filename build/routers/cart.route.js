"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const cart_controller_1 = require("../controllers/cart.controller");
const router = express_1.default.Router();
router.post('/add', auth_1.isAuthenticatedUser, cart_controller_1.addProductToCart);
exports.default = router;

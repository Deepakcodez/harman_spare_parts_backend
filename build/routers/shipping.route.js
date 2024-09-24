"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const shipping_controller_1 = require("../controllers/shipping.controller");
const router = express_1.default.Router();
router.put('/shippingInfo', auth_1.isAuthenticatedUser, shipping_controller_1.shippingAddress);
router.get('/getShippingInfo', auth_1.isAuthenticatedUser, shipping_controller_1.getShippingAddress);
router.get('/getShippingInfo/:id', auth_1.isAuthenticatedUser, shipping_controller_1.getShippingAddressByShippingId);
exports.default = router;

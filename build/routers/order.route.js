"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const order_controller_1 = require("../controllers/order.controller");
const router = express_1.default.Router();
router.post('/create', auth_1.isAuthenticatedUser, order_controller_1.newOrder);
router.post('/paymentVerify', order_controller_1.paymentVerify);
router.get('/singleOrder/:id', auth_1.isAuthenticatedUser, order_controller_1.getSingleOrder);
router.get('/myOrders', auth_1.isAuthenticatedUser, order_controller_1.myOrders);
router.get('/admin/all/orders', auth_1.isAuthenticatedUser, (0, auth_1.authorizedRole)("admin"), order_controller_1.getAllOrders);
router.delete('/admin/remove/:id', auth_1.isAuthenticatedUser, (0, auth_1.authorizedRole)("admin"), order_controller_1.deleteOrder);
router.put('/admin/update/status/', auth_1.isAuthenticatedUser, (0, auth_1.authorizedRole)("admin"), order_controller_1.updateOrder);
exports.default = router;

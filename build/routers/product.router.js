"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const product_controller_1 = require("../controllers/product.controller");
const auth_1 = require("../middleware/auth");
const cloudinary_1 = require("../utils/cloudinary");
const router = express_1.default.Router();
router.post("/admin/create", auth_1.isAuthenticatedUser, cloudinary_1.upload.array('images', 5), (0, asyncHandler_1.default)(product_controller_1.createProduct));
router.get("/allProducts", (0, asyncHandler_1.default)(product_controller_1.getAllProducts));
router.put("/admin/update/:id", auth_1.isAuthenticatedUser, (0, auth_1.authorizedRole)("admin"), (0, asyncHandler_1.default)(product_controller_1.updateProduct));
router.delete("/admin/delete/:id", auth_1.isAuthenticatedUser, (0, auth_1.authorizedRole)("admin"), (0, asyncHandler_1.default)(product_controller_1.deleteProduct));
router.get("/product/:id", (0, asyncHandler_1.default)(product_controller_1.getProduct));
router.put("/create/review", auth_1.isAuthenticatedUser, product_controller_1.createProductReview);
router.get("/reviews/:id", product_controller_1.productAllReview);
router.get("/admin/all", auth_1.isAuthenticatedUser, (0, auth_1.authorizedRole)("admin"), (0, asyncHandler_1.default)(product_controller_1.getAllProductsAdmin));
exports.default = router;

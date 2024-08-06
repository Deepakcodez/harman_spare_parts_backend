"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShippingAddress = exports.shippingAddress = void 0;
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const errorHandler_1 = require("../utils/errorHandler");
const shippingInfo_model_1 = __importDefault(require("../model/shippingInfo.model"));
// //shipping address
exports.shippingAddress = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { address, city, state, country, pinCode, phoneNo } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const shippingDetail = {
        address,
        city,
        state,
        country,
        pinCode,
        phoneNo,
        user: userId
    };
    try {
        if (!address || !city || !state || !country || !pinCode || !phoneNo) {
            return next(new errorHandler_1.ErrorHandler("Provide all details", 404));
        }
        const shipping = yield shippingInfo_model_1.default.findOne({ user: userId });
        if (shipping) {
            // Update existing shipping address
            shipping.address = address;
            shipping.city = city;
            shipping.state = state;
            shipping.country = country;
            shipping.pinCode = pinCode;
            shipping.phoneNo = phoneNo;
            shipping.user = userId;
            yield shipping.save();
        }
        else {
            // Create new shipping address
            yield shippingInfo_model_1.default.create(shippingDetail);
        }
        res.status(200).json({
            success: true,
            message: shipping ? "Shipping address updated successfully" : "Shipping address created successfully",
        });
    }
    catch (error) {
        console.error("Error in saving shipping info:", error);
        res.status(500).json({
            success: false,
            message: "Unable to save shipping info. Please try again.",
        });
    }
}));
//get shipping address
exports.getShippingAddress = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    if (!userId) {
        return next(new errorHandler_1.ErrorHandler("UnAuthorised user", 400));
    }
    try {
        const shippingDetails = yield shippingInfo_model_1.default.findOne({ user: userId });
        if (!shippingDetails)
            return next(new errorHandler_1.ErrorHandler("No details provided", 400));
        res.status(200).json({
            success: true,
            shippingDetails
        });
    }
    catch (error) {
        console.error("Error in finding shipping info:", error);
        res.status(500).json({
            success: false,
            message: "Unable to finding shipping info. Please try again.",
        });
    }
}));

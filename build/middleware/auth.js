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
exports.authorizedRole = exports.logout = exports.isAuthenticatedUser = void 0;
const asyncHandler_1 = __importDefault(require("./asyncHandler"));
const errorHandler_1 = require("../utils/errorHandler");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../model/user.model"));
exports.isAuthenticatedUser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.cookies;
    console.log(">>>>>>>>>>>", token);
    if (!token) {
        return next(new errorHandler_1.ErrorHandler("Please login to access", 401));
    }
    const decodedData = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    req.user = yield user_model_1.default.findById(decodedData.id);
    if (!req.user) {
        return next(new errorHandler_1.ErrorHandler("User not found", 404));
    }
    next();
}));
exports.logout = (0, asyncHandler_1.default)((req, resp) => __awaiter(void 0, void 0, void 0, function* () {
    resp.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
    });
    resp.status(200).json({
        success: true,
        message: "Logged out",
    });
}));
const authorizedRole = (...roles) => {
    return (req, resp, next) => {
        var _a;
        console.log('>>>>>>>>>>>', req.user);
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new errorHandler_1.ErrorHandler(`Role ${(_a = req.user) === null || _a === void 0 ? void 0 : _a.role} is not allow this resource`, 403));
        }
        next();
    };
};
exports.authorizedRole = authorizedRole;

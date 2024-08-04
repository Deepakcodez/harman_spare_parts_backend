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
exports.deleteUserprofile = exports.updateUserProfile = exports.getSingleUser = exports.getAllUsers = exports.updateProfile = exports.updatePassword = exports.getUserDetails = exports.resetPassword = exports.forgetpassword = exports.login = exports.register = void 0;
const errorHandler_1 = require("../utils/errorHandler");
const user_model_1 = __importDefault(require("../model/user.model"));
const JWTtoken_1 = require("../utils/JWTtoken");
const sendEmail_1 = require("../utils/sendEmail");
const asyncHandler_1 = __importDefault(require("../middleware/asyncHandler"));
const crypto_1 = __importDefault(require("crypto"));
// register user
const register = (req, resp, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return next(new errorHandler_1.ErrorHandler("User credentials are not provided", 400));
    }
    // Check if user already exists
    const existingUser = yield user_model_1.default.findOne({ email });
    if (existingUser) {
        return next(new errorHandler_1.ErrorHandler("Email is already registered", 400));
    }
    const user = yield user_model_1.default.create({
        name,
        email,
        password,
        avatar: {
            public_id: "this is public is",
            url: "this is url",
        },
    });
    (0, JWTtoken_1.sendToken)(user, 200, resp);
});
exports.register = register;
//login user
const login = (req, resp, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new errorHandler_1.ErrorHandler("User credentials are not provided", 400));
    }
    const user = yield user_model_1.default.findOne({ email }).select("+password");
    if (!user) {
        throw new errorHandler_1.ErrorHandler("user not found", 401);
    }
    const isPasswordMatched = yield user.comparePassword(password);
    if (!isPasswordMatched) {
        throw new errorHandler_1.ErrorHandler("User credentials are not correct", 401);
    }
    (0, JWTtoken_1.sendToken)(user, 200, resp);
});
exports.login = login;
//forget password api
const forgetpassword = (req, resp, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findOne({ email: req.body.email });
    if (!user) {
        return next(new errorHandler_1.ErrorHandler("user not found", 404));
    }
    //get reset password token
    const resetToken = user.getResetPasswordToken();
    yield user.save({ validateBeforeSave: false });
    const resetPasswordURL = `${req.protocol}://${req.get("host")}/api/v1/user/password/reset/${resetToken}`;
    const message = `your password reset token is :- \n\n ${resetPasswordURL}\n\n if you have not request this than ignore it`;
    try {
        yield (0, sendEmail_1.sendEmail)({
            email: user.email,
            subject: `Password recovery`,
            message,
        });
        resp.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        });
    }
    catch (error) {
        user.resetPasswordExpire = undefined;
        user.resetPasswordToken = undefined;
        yield user.save({ validateBeforeSave: false });
        return next(new errorHandler_1.ErrorHandler(error.message, 500));
    }
});
exports.forgetpassword = forgetpassword;
//reset password
exports.resetPassword = (0, asyncHandler_1.default)((req, resp, next) => __awaiter(void 0, void 0, void 0, function* () {
    //creating token hash
    const resetPasswordToken = crypto_1.default
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");
    const user = yield user_model_1.default.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
        return next(new errorHandler_1.ErrorHandler("Reset password token is expired", 400));
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new errorHandler_1.ErrorHandler("Password does not match with confirm password", 400));
    }
    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    yield user.save();
    (0, JWTtoken_1.sendToken)(user, 200, resp);
}));
//get user by id
exports.getUserDetails = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = yield user_model_1.default.findById((_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
    if (!user) {
        return next(new errorHandler_1.ErrorHandler("User not found", 404));
    }
    res.status(200).json({
        success: true,
        user,
    });
}));
//update password
exports.updatePassword = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const user = yield user_model_1.default.findById((_b = req.user) === null || _b === void 0 ? void 0 : _b.id).select("+password");
    if (!user) {
        return next(new errorHandler_1.ErrorHandler("User not found", 400));
    }
    const isPasswordMatched = yield user.comparePassword(req.body.oldPassword);
    if (!isPasswordMatched) {
        return next(new errorHandler_1.ErrorHandler("Old password is incorrect", 400));
    }
    if (req.body.newPassword !== req.body.confirmNewPassword) {
        return next(new errorHandler_1.ErrorHandler("New passwords do not match", 400));
    }
    user.password = req.body.newPassword;
    yield user.save();
    (0, JWTtoken_1.sendToken)(user, 200, res);
}));
//update Profile
exports.updateProfile = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };
    // Add cloudinary later
    const user = yield user_model_1.default.findByIdAndUpdate((_c = req.user) === null || _c === void 0 ? void 0 : _c.id, newUserData, {
        new: true,
        runValidators: true,
        context: "query",
    });
    if (!user) {
        return next(new errorHandler_1.ErrorHandler("User not found", 400));
    }
    res.status(200).json({
        success: true,
        user,
    });
}));
// Get all products -- Admin
exports.getAllUsers = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.find();
    if (user.length === 0) {
        return next(new errorHandler_1.ErrorHandler("No products found", 404));
    }
    res.status(200).json({
        success: true,
        user,
    });
}));
//get single user -- Admin
exports.getSingleUser = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(req.params.id);
    if (!user) {
        return next(new errorHandler_1.ErrorHandler("User not found", 404));
    }
    res.status(200).json({
        success: true,
        user,
    });
}));
//update user Profile -- Admin
exports.updateUserProfile = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    };
    const user = yield user_model_1.default.findByIdAndUpdate((_d = req.params) === null || _d === void 0 ? void 0 : _d.id, newUserData, {
        new: true,
        runValidators: true,
        context: "query",
    });
    if (!user) {
        return next(new errorHandler_1.ErrorHandler("User not found", 400));
    }
    res.status(200).json({
        success: true,
        user,
    });
}));
//update user Profile -- Admin
exports.deleteUserprofile = (0, asyncHandler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findByIdAndDelete(req.params.id);
    if (!user) {
        return next(new errorHandler_1.ErrorHandler("User not found", 400));
    }
    res.status(200).json({
        success: true,
        message: "User deleted successfully"
    });
}));

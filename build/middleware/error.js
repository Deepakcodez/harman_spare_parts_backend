"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("../utils/errorHandler");
const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    // Handle Mongoose CastError (e.g., invalid ObjectId)
    if (err.name === "CastError") {
        const castErrorMessage = `Resource not found with id ${err.name}`;
        err = new errorHandler_1.ErrorHandler(castErrorMessage, 400);
    }
    // Handle MongoDB Duplicate Key Error (code 11000)
    if (err.code === 11000 && err.keyValue) {
        const key = Object.keys(err.keyValue)[0];
        const value = err.keyValue[key];
        const duplicateKeyMessage = `Duplicate value entered for ${key}: ${value}`;
        err = new errorHandler_1.ErrorHandler(duplicateKeyMessage, 400);
    }
    // json web toke error
    if (err.name === "jsonWebToken") {
        const Message = `Json web token is Invalid`;
        err = new errorHandler_1.ErrorHandler(Message, 400);
    }
    // token expied error
    if (err.name === "TokenExpiredError") {
        const Message = `Json web token is Invalid`;
        err = new errorHandler_1.ErrorHandler(Message, 400);
    }
    // Update status code and message from the modified error
    statusCode = err.statusCode || statusCode;
    message = err.message || message;
    res.status(statusCode).json({
        success: false,
        message: message,
    });
};
exports.default = errorMiddleware;

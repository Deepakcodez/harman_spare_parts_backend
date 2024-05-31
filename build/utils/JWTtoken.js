"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = void 0;
const sendToken = (user, statusCode, resp) => {
    const token = user.getJWTToken();
    // Option for cookies
    const options = {
        expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };
    resp.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        token
    });
};
exports.sendToken = sendToken;

import { Response } from "express";
import { UserDocument } from "../model/user.model"; // Ensure this path is correct

export const sendToken = (user: UserDocument, statusCode: number, resp: Response) => {
    const token = user.getJWTToken();

    // Option for cookies
    const options = {
        expires: new Date(
            Date.now() + Number(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    resp.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        token
    });
};

import express,{request,response} from "express";
import { forgetpassword, getUserDetails, login, register, resetPassword, } from "../controllers/user.controller";
import asyncHandler from "../middleware/asyncHandler";
import { isAuthenticatedUser, logout } from "../middleware/auth";
const router = express.Router();


router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/logout', asyncHandler(logout));
router.post('/forgetPassword', asyncHandler(forgetpassword));
router.put('/password/reset/:token', asyncHandler(resetPassword));
router.get('/detail', isAuthenticatedUser, asyncHandler(getUserDetails));





export default router;
import express,{request,response} from "express";
import { forgetpassword, getUserDetails, login, register, resetPassword, updatePassword, } from "../controllers/user.controller";
import asyncHandler from "../middleware/asyncHandler";
import { isAuthenticatedUser, logout } from "../middleware/auth";
const router = express.Router();


router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/logout', asyncHandler(logout));
router.post('/forgetPassword',isAuthenticatedUser, asyncHandler(forgetpassword));
router.put('/password/reset/:token',isAuthenticatedUser, asyncHandler(resetPassword));
router.get('/detail', isAuthenticatedUser, asyncHandler(getUserDetails));
router.post('/update/password', isAuthenticatedUser, asyncHandler(updatePassword));





export default router;
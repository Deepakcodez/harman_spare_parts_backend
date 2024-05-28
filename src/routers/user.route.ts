import express,{request,response} from "express";
import { forgetpassword, getAllUsers, getSingleUser, getUserDetails, login, register, resetPassword, updatePassword, updateProfile, } from "../controllers/user.controller";
import asyncHandler from "../middleware/asyncHandler";
import { authorizedRole, isAuthenticatedUser, logout } from "../middleware/auth";
const router = express.Router();


router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/logout', asyncHandler(logout));
router.post('/forgetPassword',isAuthenticatedUser, asyncHandler(forgetpassword));
router.put('/password/reset/:token',isAuthenticatedUser, asyncHandler(resetPassword));
router.get('/detail', isAuthenticatedUser, asyncHandler(getUserDetails));
router.post('/admin/update/password', isAuthenticatedUser, asyncHandler(updatePassword));
router.post('/admin/update/profile', isAuthenticatedUser, asyncHandler(updateProfile));
router.get('/admin/users', isAuthenticatedUser, authorizedRole("admin"), asyncHandler(getAllUsers));
router.get('/admin/user/:id', isAuthenticatedUser, authorizedRole("admin"), asyncHandler(getSingleUser));





export default router;
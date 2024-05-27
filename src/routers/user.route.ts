import express,{request,response} from "express";
import { forgetpassword, login, register, } from "../controllers/user.controller";
import asyncHandler from "../middleware/asyncHandler";
import { logout } from "../middleware/auth";
const router = express.Router();


router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/logout', asyncHandler(logout));
router.post('/forgetPassword', asyncHandler(forgetpassword));





export default router;
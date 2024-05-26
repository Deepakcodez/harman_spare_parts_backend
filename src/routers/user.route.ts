import express,{request,response} from "express";
import { register, } from "../controllers/user.controller";
import asyncHandler from "../middleware/asyncHandler";
const router = express.Router();


router.post('/register', asyncHandler(register));





export default router;
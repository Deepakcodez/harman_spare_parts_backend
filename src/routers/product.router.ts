import express,{request,response} from "express";
import { createProduct } from "../controllers/product.controller";
const router = express.Router();


router.route('/create').post(createProduct)





export default router;
import express,{request,response} from "express";
import { createProduct, getAllProducts ,updateProduct} from "../controllers/product.controller";
const router = express.Router();


router.route('/create').post(createProduct)
router.route('/allProducts').get(getAllProducts)
router.route('/update/:id').put(updateProduct)





export default router;
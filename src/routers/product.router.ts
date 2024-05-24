import express,{request,response} from "express";
import { createProduct, getAllProducts ,updateProduct, deleteProduct,getProductById, } from "../controllers/product.controller";
const router = express.Router();


router.route('/create').post(createProduct)
router.route('/allProducts').get(getAllProducts)
router.route('/product/:id').get(getProductById)
router.route('/update/:id').put(updateProduct)
router.route('/delete/:id').delete(deleteProduct)





export default router;
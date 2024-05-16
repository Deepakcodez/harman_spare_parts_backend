import express,{request,response} from "express";
import { demo } from "../controllers/user.controller";
const router = express.Router();


router.route('/demo').get(demo)





export default router;
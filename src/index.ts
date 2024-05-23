import express, { request, response } from "express";
const app = express();
const PORT = 8000;
import { connectDB } from "./utils/dbConnection";

//connecting database
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routers
import userRouter from './routers/user.route';
import productRouter from './routers/product.router';




app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);





app.listen(PORT,()=>{
    console.log(`server is running at port ${PORT}`)
})
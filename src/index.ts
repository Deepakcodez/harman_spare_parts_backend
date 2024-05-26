import 'dotenv/config'
import express, { request, response } from "express";
const app = express();
import { connectDB } from "./utils/dbConnection";
import errorMiddleware from "./middleware/error"
const PORT = process.env.PORT ||8000;
//handling uncaught error
process.on("uncaughtException", (err)=>{
    console.log('>>>>>>>>>>>Error', err.message)
    console.log('>>>>>>>>>>>shutting own server due to uncaughtException promise')
    process.exit(1);
})

//connecting database
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//routers
import userRouter from './routers/user.route';
import productRouter from './routers/product.router';




app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);

app.use(errorMiddleware)




const server = app.listen(PORT,()=>{
    console.log(`server is running at port ${PORT}`)
})

//Handling unhandled promise
process.on("unhandledRejection",(err:any)=>{
    console.log('>>>>>>>>>>>Error', err.message)
    console.log('>>>>>>>>>>>shutting own server due to unhandle promise')
    server.close(()=>{
        process.exit(1);
    });
});
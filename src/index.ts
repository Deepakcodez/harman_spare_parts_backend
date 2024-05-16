import express, { request, response } from "express";
const app = express();
const PORT = 8000;


//routers
import userRouter from './routers/user.route';




app.use("/api/v1/user", userRouter);





app.listen(PORT,()=>{
    console.log(`server is running at port ${PORT}`)
})
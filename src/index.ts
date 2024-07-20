import "dotenv/config";
import express, { Request, Response } from "express";
const app = express();
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./utils/dbConnection";
import errorMiddleware from "./middleware/error";
// import  Redis  from "ioredis";
const PORT = process.env.PORT || 8000;
//handling uncaught error
process.on("uncaughtException", (err) => {
  console.log(">>>>>>>>>>>Error", err.message);
  console.log(
    ">>>>>>>>>>>shutting own server due to uncaughtException promise"
  );
  process.exit(1);
});

//connecting database
connectDB();

// Middlewares
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// export const redis = new Redis({
//   host : process.env.REDIS_HOST,
//   port : Number(process.env.REDIS_PORT),
//   password : process.env.REDIS_PASSWORD
// })

//  redis.on("connect", ()=>{
//   console.log("redis connected")
//  })
//  redis.on("error", (err) => {
//   console.error("Redis connection error:", err);
// });



//routers
import userRouter from "./routers/user.route";
import productRouter from "./routers/product.router";
import orderRouter from "./routers/order.route";
import cartRouter from "./routers/cart.route";

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/cart", cartRouter);

app.use(errorMiddleware);

const server = app.listen(PORT, () => {
  console.log(`server is running at port ${PORT}`);
});

//Handling unhandled promise
process.on("unhandledRejection", (err: any) => {
  console.log(">>>>>>>>>>>Error", err.message);
  console.log(">>>>>>>>>>>shutting own server due to unhandled promise");
  server.close(() => {
    process.exit(1);
  });
});

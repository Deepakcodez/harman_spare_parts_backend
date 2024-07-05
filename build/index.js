"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dbConnection_1 = require("./utils/dbConnection");
const error_1 = __importDefault(require("./middleware/error"));
const PORT = process.env.PORT || 8000;
//handling uncaught error
process.on("uncaughtException", (err) => {
    console.log(">>>>>>>>>>>Error", err.message);
    console.log(">>>>>>>>>>>shutting own server due to uncaughtException promise");
    process.exit(1);
});
//connecting database
(0, dbConnection_1.connectDB)();
// Middlewares
const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
//routers
const user_route_1 = __importDefault(require("./routers/user.route"));
const product_router_1 = __importDefault(require("./routers/product.router"));
const order_route_1 = __importDefault(require("./routers/order.route"));
const cart_route_1 = __importDefault(require("./routers/cart.route"));
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use("/api/v1/user", user_route_1.default);
app.use("/api/v1/product", product_router_1.default);
app.use("/api/v1/order", order_route_1.default);
app.use("/api/v1/cart", cart_route_1.default);
app.use(error_1.default);
const server = app.listen(PORT, () => {
    console.log(`server is running at port ${PORT}`);
});
//Handling unhandled promise
process.on("unhandledRejection", (err) => {
    console.log(">>>>>>>>>>>Error", err.message);
    console.log(">>>>>>>>>>>shutting own server due to unhandle promise");
    server.close(() => {
        process.exit(1);
    });
});

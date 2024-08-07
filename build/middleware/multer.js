"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploader = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
exports.uploader = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path_1.default.resolve(__dirname, 'public/temp'));
        },
        filename: (req, file, cb) => {
            const newFileName = (0, uuid_1.v4)() + path_1.default.extname(file.originalname);
            cb(null, newFileName);
        },
    }),
    limits: { fileSize: 1048576 }, // 1MB
});

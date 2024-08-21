"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultipleToCloudinary = exports.upload = void 0;
const cloudinary_1 = require("cloudinary");
const multer_1 = __importDefault(require("multer"));
// Cloudinary configuration
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});
// Use in-memory storage for multer
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 1048576 }, // 1MB
});
// Utility function to wrap upload_stream in a promise
const uploadStream = (fileBuffer, options) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream(options, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result); // Type assertion here
            }
        });
        stream.end(fileBuffer);
    });
};
// Middleware function to handle file upload to Cloudinary
const uploadMultipleToCloudinary = (fileBuffers) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Upload all files to Cloudinary
        const uploadPromises = fileBuffers.map((fileBuffer) => uploadStream(fileBuffer, {
            resource_type: 'auto',
            folder: 'products',
        }));
        // Wait for all uploads to complete
        const results = yield Promise.all(uploadPromises);
        // Return Cloudinary data for all images
        return results.map(result => ({
            secure_url: result.secure_url,
            public_id: result.public_id,
        }));
    }
    catch (error) {
        throw error; // Throw error to be caught by the controller
    }
});
exports.uploadMultipleToCloudinary = uploadMultipleToCloudinary;

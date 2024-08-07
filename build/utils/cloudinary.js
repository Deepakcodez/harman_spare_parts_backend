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
exports.uploadImageOnCloudiary = void 0;
const cloudinary_1 = __importDefault(require("cloudinary"));
const fs_1 = __importDefault(require("fs"));
const cloudinary = cloudinary_1.default.v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});
const uploadImageOnCloudiary = (filePath, folderName) => __awaiter(void 0, void 0, void 0, function* () {
    if (!filePath) {
        throw new Error("File path is undefined");
    }
    try {
        const uploadResult = yield cloudinary.uploader.upload(filePath, {
            folder: folderName,
        });
        // Ensure the file exists before attempting to delete it
        if (fs_1.default.existsSync(filePath)) {
            try {
                fs_1.default.unlinkSync(filePath);
            }
            catch (error) {
                console.error("Failed to delete image from server:", error);
            }
        }
        return {
            secure_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
        };
    }
    catch (error) {
        throw new Error(`Error uploading image: ${error.message}`);
    }
});
exports.uploadImageOnCloudiary = uploadImageOnCloudiary;

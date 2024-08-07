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
const promises_1 = __importDefault(require("fs/promises")); // Use promises version of fs
const cloudinary = cloudinary_1.default.v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});
const uploadImageOnCloudiary = (localFilePath, folderName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!localFilePath) {
            throw new Error("Invalid file path");
        }
        // Upload file to Cloudinary
        const response = yield cloudinary.uploader.upload(localFilePath, {
            folder: folderName, // Specify the folder name
            resource_type: "auto",
        });
        console.log("File is uploaded on Cloudinary", response.secure_url);
        // Delete the local file after successful upload
        yield promises_1.default.unlink(localFilePath);
        console.log("Local file deleted successfully");
        return {
            secure_url: response.secure_url,
            public_id: response.public_id,
        };
    }
    catch (error) {
        console.error("Error uploading file to Cloudinary:", error.message);
        try {
            // Attempt to delete the local file even if the upload failed
            if (localFilePath) {
                yield promises_1.default.unlink(localFilePath);
                console.log("Local file deleted successfully");
            }
        }
        catch (unlinkError) {
            console.error("Error deleting local file:", unlinkError.message);
        }
        return null;
    }
});
exports.uploadImageOnCloudiary = uploadImageOnCloudiary;

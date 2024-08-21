import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { UploadApiResponse } from 'cloudinary';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Use in-memory storage for multer
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 1048576 }, // 1MB
});

// Utility function to wrap upload_stream in a promise
const uploadStream = (fileBuffer: Buffer, options: any): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result as UploadApiResponse); // Type assertion here
      }
    });
    stream.end(fileBuffer);
  });
};

// Middleware function to handle file upload to Cloudinary
export const uploadMultipleToCloudinary = async (fileBuffers: Buffer[]): Promise<{ secure_url: string; public_id: string }[]> => {
  try {
    // Upload all files to Cloudinary
    const uploadPromises = fileBuffers.map((fileBuffer) =>
      uploadStream(fileBuffer, {
        resource_type: 'auto',
        folder: 'products',
      })
    );

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);

    // Return Cloudinary data for all images
    return results.map(result => ({
      secure_url: result.secure_url,
      public_id: result.public_id,
    }));
  } catch (error) {
    throw error; // Throw error to be caught by the controller
  }
};
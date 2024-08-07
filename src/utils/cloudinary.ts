import imageuploader from 'cloudinary';
import fs from 'fs';
import path from 'path';

const cloudinary = imageuploader.v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const uploadImageOnCloudiary = async (filePath: string | undefined, folderName: string) => {
  if (!filePath) {
    throw new Error("File path is undefined");
  }

  try {
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      folder: folderName,
    });

    // Ensure the file exists before attempting to delete it
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (error) {
        console.error("Failed to delete image from server:", error);
      }
    }

    return {
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };
  } catch (error: any) {
    throw new Error(`Error uploading image: ${error.message}`);
  }
};

export { uploadImageOnCloudiary };

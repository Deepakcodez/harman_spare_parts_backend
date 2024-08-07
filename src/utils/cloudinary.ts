import imageuploader from 'cloudinary';
import fs from 'fs/promises'; // Use promises version of fs

const cloudinary = imageuploader.v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

interface UploadResult {
  secure_url: string;
  public_id: string;
}

const uploadImageOnCloudiary = async (localFilePath: string | undefined, folderName: string): Promise<UploadResult | null> => {
  try {
    if (!localFilePath) {
      throw new Error("Invalid file path");
    }

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: folderName, // Specify the folder name
      resource_type: "auto",
    });

    console.log("File is uploaded on Cloudinary", response.secure_url);

    // Delete the local file after successful upload
    await fs.unlink(localFilePath);
    console.log("Local file deleted successfully");

    return {
      secure_url: response.secure_url,
      public_id: response.public_id,
    };
  } catch (error: any) {
    console.error("Error uploading file to Cloudinary:", error.message);

    try {
      // Attempt to delete the local file even if the upload failed
      if (localFilePath) {
        await fs.unlink(localFilePath);
        console.log("Local file deleted successfully");
      }
    } catch (unlinkError: any) {
      console.error("Error deleting local file:", unlinkError.message);
    }

    return null;
  }
};

export { uploadImageOnCloudiary };

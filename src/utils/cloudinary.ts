import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
});

console.log("Cloudinary config check:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "exists" : "MISSING",
  api_key: process.env.CLOUDINARY_API_KEY ? "exists" : "MISSING",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "exists" : "MISSING",
});

const uploadImageBufferToCloudinary = async (buffer: Buffer) => {
  try {
    if (!buffer) return null;

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "deepfake-detector/images",
          public_id: `image-${Date.now()}`,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload_stream error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    console.log("Image uploaded successfully:", result.secure_url);
    return result;
  } catch (err: any) {
    console.error("Cloudinary full error:", JSON.stringify(err, null, 2));
    console.error("Error message:", err.message);
    console.error("Error http_code:", err.http_code);
    return null;
  }
};

const uploadVideoBufferToCloudinary = async (buffer: Buffer) => {
  try {
    if (!buffer) return null;

    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "deepfake-detector/videos",
          public_id: `video-${Date.now()}`,
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary video upload error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    console.log("Video uploaded successfully:", result.secure_url);
    return result;
  } catch (err: any) {
    console.error("Cloudinary full error:", JSON.stringify(err, null, 2));
    console.error("Error message:", err.message);
    console.error("Error http_code:", err.http_code);
    return null;
  }
};

const deleteFromCloudinary = async (
  publicId: string,
  resource_type: "image" | "video" | "raw" = "image"
) => {
  try {
    if (!publicId) return null;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type,
    });

    console.log("File deleted successfully from Cloudinary", result);
    return result;
  } catch (err) {
    console.error("Error deleting file from Cloudinary", err);
    return null;
  }
};

export {
  uploadImageBufferToCloudinary,
  uploadVideoBufferToCloudinary,
  deleteFromCloudinary,
};
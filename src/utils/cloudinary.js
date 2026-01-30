import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadonCloudinary = async (filepath) => {
  try {
    if (!filepath) return null;
    const response = await cloudinary.uploader.upload(filepath, {
      resource_type: "auto",
    });
    console.log("File has Uploaded Successfully On Cloudinary", response.url);
    fs.unlinkSync(filepath); // Remove the locally saved temporary  file after successful upload
    return response;
  } catch (err) {
    fs.unlinkSync(filepath); // Remove the locally saved temporary  file as the upload operation got failed
    console.log(" Unable to Upload the File", err);
    return null;
  }
};
 

export { uploadonCloudinary };

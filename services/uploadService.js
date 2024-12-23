import cloudinary from "../utils/cloudinary.js";
import sharp from "sharp";
const uploadFile = async (filePath, type, folderName) => {
  try {
    if (type === "image") {
      const resizedImageBuffer = await sharp(filePath)
        // .resize({ width: 400, height: 400 })
        .webp({ quality: 100 })
        .toBuffer();
      console.log("🥀 ~ uploadFile ~ folderName:", folderName);
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { resource_type: "image", folder: folderName },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(resizedImageBuffer);
      });
    } else if (type === "video" || type === "record") {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          filePath,
          {
            resource_type: "video",
            folder: folderName,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });
    }
  } catch (error) {
    console.log(error);
  }
};
export { uploadFile };

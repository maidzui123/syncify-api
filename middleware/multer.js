import multer from "multer";
import sendResponse from "../helper/sendResponse.helper.js";
const storage = multer.diskStorage({
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

const fileFilter = (req, file, callback) => {
  const allowedTypes = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/quicktime",
    "audio/mpeg",
    "audio/x-m4a",
    "audio/m4a",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    const unsupportedType = file.mimetype || "unknown";
    req.fileValidationError = `File type '${unsupportedType}' not supported.`;
    callback(null, false);
  }
};

const upload = multer({
  destination: "./temp",
  storage: storage,
  fileFilter: fileFilter,
});

export default upload;

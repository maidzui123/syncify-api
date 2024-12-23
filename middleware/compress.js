import ffmpeg from "fluent-ffmpeg";
import path from "path";

const compressVideo = async (inputPath, outputFolder) => {
  const outputPath = path.join(outputFolder, `compressed_${Date.now()}.mp4`);

  console.log("🥀 ~ compressVideo ~ outputPath:", outputPath)
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec("libx264") // Codec hiệu quả cho nén
      .size("640x?") // Giảm độ phân giải (giữ nguyên tỷ lệ)
      .outputOptions("-preset", "slow") // Tùy chỉnh hiệu suất nén
      .outputOptions("-crf", "28") // CRF (Constant Rate Factor): giá trị 18-28. 28 nén nhiều hơn nhưng giảm chất lượng
      .on("end", () => {
        resolve(outputPath);
      })
      .on("error", (err) => {
        reject(err);
      })
      .run();
  });
};

export default compressVideo;
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

/**
 * Upload file to Cloudinary using stream
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {String} fileType - MIME type (e.g., 'image/jpeg', 'video/mp4')
 * @returns {Promise<String>} - Cloudinary secure URL with optimizations
 */
const uploadToCloudinary = (fileBuffer, fileType) => {
  return new Promise((resolve, reject) => {
    try {
      // Determine resource type based on MIME type
      const resourceType = fileType && fileType.startsWith("video/") ? "video" : "image";

      // Upload options with optimizations
      const uploadOptions = {
        folder: "civic_issues",
        resource_type: resourceType,
        quality: "auto",
        fetch_format: "auto",
        timeout: 120000, // 2 minutes timeout
      };

      // Create stream from buffer
      const stream = Readable.from(fileBuffer);

      // Upload stream to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else if (result && result.secure_url) {
            console.log("Upload successful:", result.public_id, result.secure_url);
            resolve(result.secure_url);
          } else {
            reject(new Error("Cloudinary upload returned no URL"));
          }
        }
      );

      // Pipe buffer to upload stream
      stream.pipe(uploadStream);

      // Handle stream errors
      stream.on("error", (error) => {
        console.error("Stream error:", error);
        reject(new Error(`Stream error: ${error.message}`));
      });
    } catch (error) {
      console.error("Upload utility error:", error);
      reject(error);
    }
  });
};

module.exports = { uploadToCloudinary };


const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET_KEY,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) throw new Error("No file path provided");

        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // File has been uploaded successfully
        // Optionally log or handle the response
        console.log("File is uploaded on Cloudinary:", response.url);

        // Delete the locally saved temporary file
        fs.unlinkSync(localFilePath);

        // Return the Cloudinary response
        return response;
    } catch (error) {
        // Handle errors
        console.error("Error uploading file to Cloudinary:", error);

        // Remove the locally saved temporary file as the upload operation failed
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        // Return null to indicate failure
        return null;
    }
};

module.exports = { uploadOnCloudinary };

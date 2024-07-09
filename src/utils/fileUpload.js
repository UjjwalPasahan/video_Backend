import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const fileUpload = async function (localFilePath) {
    try {
        if (!localFilePath) throw new Error('File path is required');
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });
        console.log(`File uploaded to cloudinary: ${response.url}`);
        fs.unlinkSync(localFilePath); // Remove the local file after upload
        return response;
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Remove the local file if upload fails
        }
        throw new Error(`File upload failed: ${error.message}`);
    }
}

export { fileUpload };

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const deleteFile = async function (localFilePath) {
    try {
        if (!localFilePath) throw new Error('File path is required');
        const response = await cloudinary.uploader.destroy(localFilePath,(err,result)=>{
            if (error) {
                console.error('Error deleting image:', error);
              } else {
                console.log('Image deleted successfully:', result);
              }
        });
        
        return response;
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath); // Remove the local file if upload fails
        }
        throw new Error(`File upload failed: ${error.message}`);
    }
}

export { deleteFile };

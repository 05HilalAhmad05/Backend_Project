import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


const uploadOnCloudinary = async (localFilePath) => {
    try {

        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        })


        fs.unlinkSync(localFilePath); // delete the local file after uploading
        return response; // return the response from Cloudinary, which includes the URL of the uploaded image
    } catch (error) {
        fs.unlinkSync(localFilePath); // delete the local file in case of an error as well
        return null;
    }
}

const deleteFromCloudinary = async (oldImageUrl) => {
    try {
        if (!oldImageUrl) return null;

        // Extract the public ID from the URL
        const publicId = oldImageUrl.split('/').pop().split('.')[0]; // / means split by / and pop() means get the last element of the array and then split by . and get the first element which is the public id
        const response = await cloudinary.uploader.destroy(publicId);
        return response;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return null;
    }
}
export { uploadOnCloudinary, deleteFromCloudinary }

import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadonCloudinary = async(localfilepath:string)=> {
    try{
        if(!localfilepath)
        {
            return null;
        }
        //uploadonCloudinary
        const result = await cloudinary.uploader.upload(localfilepath,{
            resource_type:'auto',
        })

        console.log("File uploaded successfully to cloudinary",result);
        //delete local file
        fs.unlinkSync(localfilepath);
        return result;
    }
    catch(err){
        if(fs.existsSync(localfilepath))
        {
            fs.unlinkSync(localfilepath);
        }
        console.error("Error uploading file to cloudinary",err);
        return null;
    }
}

const deleteFromCloudinary = async(publicId:string,
    resource_type: "image" | "video" | "raw"="image"
)=>{
    try{
        if(!publicId)        {
            return null;
        }
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resource_type });
        console.log("File deleted successfully from cloudinary",result);
        return result;
    }
    catch(err){
        console.error("Error deleting file from cloudinary",err);
        return null;
    }
}

export {uploadonCloudinary,deleteFromCloudinary};
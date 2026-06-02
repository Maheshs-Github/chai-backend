import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"


console.log("Hello Ther, Te Key: ",process.env.CLOUDINARY_API_KEY);
  cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// const uploadOnCloudinary=async (localFilePath) =>{
//   try {
//     if(!localFilePath) return null;
//     const res= await cloudinary.uploader.upload(localFilePath,{
//       resource_type:'auto'
//     })
//     console.log("File has been uploaded Successfully ",res.url)
//     return res;
//   } catch (error) {
//     fs.unlinkSync(localFilePath)
//     // Remove the locally uploaded file as the opeartion is failed 
//     return null;
//   }
// }

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("Uploaded:", res.secure_url);

    // delete local file after upload
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return res;
  } catch (error) {
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};

const deleteFromCloudinary=async(avatar)=>{
  try {
    const parts=avatar.split("/")
    const fileName=((parts[parts.length-1]).split("."))[0]
    await cloudinary.uploader.destroy(fileName)
    console.log("Old Image from Cloudinary has been Deleted Successfully ")
  } catch (error) {
    console.log("Error while Deleteing the Image: ",error);
    
  }

}
export {uploadOnCloudinary,deleteFromCloudinary}
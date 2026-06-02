import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
// import jwt from "jsonwebtoken"
// import bcrypt from "bcrypt"

const videoSchema=new mongoose.Schema({
  videoFile:{
    type:String, //Video Url
    required:true
  },
    thumbnail:{
    type:String, //Img Url
    required:true
  },
    title:{
    type:String, 
    required:true
  },
    description:{
    type:String, 
    required:true
  },
    duration:{
    type:Number, 
    required:true,
  },
    views:{
    type:Number, 
    required:true,
    default:0
  },
    isPublished:{
    type:Boolean, 
    default:true
  },
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  }
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)


export const Video=mongoose.model("Video",videoSchema)
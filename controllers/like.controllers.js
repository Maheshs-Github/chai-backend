import { Like } from "../models/likes.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) throw new ApiError(400, "Video Id is Missing");
  const isLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });
  let isNowLiked;
  if (isLiked) {
    await Like.findByIdAndDelete(isLiked?._id);
    isNowLiked = false;
  } else {
    await Like.create({ video: videoId, likedBy: req.user?._id });
    isNowLiked = true;
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { LikedVideo: isNowLiked },
        "Video Like has been updated Successfully"
      )
    );
});

const toggleTweetLike=asyncHandler(async(req,res)=>{
  const {tweetId}=req.params;
  if(!tweetId)
    throw new ApiError(400,"Tweet Id is missing");

  const isLiked=await Like.findOne({tweet:tweetId,likedBy:req.user?._id})
  let isNowLiked;
  if(isLiked)
  {
    await Like.findByIdAndDelete(isLiked?._id);
    isNowLiked=false;
  }
  else{
    await Like.create({tweet:tweetId,likedBy:req.user?._id})
    isNowLiked=true
  }

  return res.status(200).json(new ApiResponse(200,{isLiked:isNowLiked},"Tweet Like Staus has been updated Succesfuilly"))
})


const toggleCommentLike=asyncHandler(async(req,res)=>{
  const {commentId}=req.params;
  if(!commentId)
    throw new ApiError(400,"Comment Id is missing ");

  const isLiked=await Like.findOne({comment:commentId,likedBy:req.user?._id})

  let isNowLiked;
  if(isLiked)
  {
    await Like.findByIdAndDelete(isLiked?._id)
    isNowLiked=false;
  }
  else{
    await Like.create({comment:commentId,likedBy:req?.user?._id})
    isNowLiked=true;
  }

  return res.status(200).json(new ApiResponse(200,{isLiked:isNowLiked},"Commnet like status has been updated"))
})

const getLikedVideos=asyncHandler(async(req,res)=>{
  const videos=await Like.find({likedBy:req.user?._id,video:{$ne:null}}).populate("video");
  // const videos=await Like.find({likedBy:req.user?._id,video:{$ne:null}}).select("-__v -createdAt -updatedAt").populate("video","-__v -createdAt -updatedAt");
  // const videos=await Like.find({likedBy:req.user?._id}).populate("video");

  if(videos.length==0)
    throw new ApiError(404,"No Video Found")

  const LikedVideos=videos.map(v=>v.video)
  // console.log("Videos: ",videos)

  return res.status(200).json(new ApiResponse(200,LikedVideos,"Fteched Liked Videos Successfully"))

})

const getLikedComments=asyncHandler(async(req,res)=>{
  const commnets=await Like.find({likedBy:req.user?._id,comment:{$ne:null}}).select("-__v -createdAt -updatedAt").populate("comment","-__v -createdAt -updatedAt -likedBy")

  if(commnets.length===0) 
    throw new ApiError(404,"No Commnets Found");

  return res.status(200).json(new ApiResponse(200,commnets,"LIked Commnets has been Fetched Successfully"))
})

export { toggleVideoLike ,toggleTweetLike,toggleCommentLike,getLikedVideos,getLikedComments};



import { Like } from "../models/likes.models.js";
import { Playlist } from "../models/playlists.models.js";
import { Subscription } from "../models/subscriptions.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getChannelVideos=asyncHandler(async(req,res)=>{
  
  const channelVideos=await Video.find({owner:req.user?._id})
  console.log("channelVideos: ",channelVideos)

  if(channelVideos.length===0)
    throw new ApiError(404,"No Videos Found of the channel");
  return res.status(200).json(new ApiResponse(200,channelVideos,"Videos of the channel has been fetched succesfully"));
})

const getChannelStats=asyncHandler(async(req,res)=>{
  // Get total subscribers,videos,likes on -> videos, commensts,tweets,playlists
  //also dispplay the videos amd playlists

  // const totalSubscribers=await Subscription.find({channel:req.user?._id}).countDocuments();
  // const totalVideos=await Video.find({owner:req.user?._id}).countDocuments();
  // const totalVideoLikes=await Like.find({likedBy:req.user?._id,video:{$ne:null}}).countDocuments();
  // const totalCommentLikes=await Like.find({likedBy:req.user?._id,comment:{$ne:null}}).countDocuments();
  // const totalTweetLikes=await Like.find({likedBy:req.user?._id,tweet:{$ne:null}}).countDocuments();
  // const totalPlaylists=await Playlist.find({owner:req.user?._id}).countDocuments();

  const [totalSubscribers,totalVideos,totalVideoLikes,totalCommentLikes,totalTweetLikes,totalPlaylists,videos,playlists]=await Promise.all([
    Subscription.find({channel:req.user?._id}).countDocuments(),
    Video.find({owner:req.user?._id}).countDocuments(),
    Like.find({likedBy:req.user?._id,video:{$ne:null}}).countDocuments(),
    Like.find({likedBy:req.user?._id,comment:{$ne:null}}).countDocuments(),
    Like.find({likedBy:req.user?._id,tweet:{$ne:null}}).countDocuments(),
    Playlist.find({owner:req.user?._id}).countDocuments(),
    Video.find({owner:req.user?._id}),
    Playlist.find({owner:req.user?._id}),
  ])

  console.log("totalSubscribers: ",totalSubscribers," totalVideos: ",totalVideos," totalVideoLikes: ",totalVideoLikes," totalCommentLikes: ",totalCommentLikes," totalTweetLikes: ",totalTweetLikes," totalPlaylists: ",totalPlaylists,"videos: ",videos," playlists: ",playlists);

  return res.status(200).json(new ApiResponse(200,{"totalSubscribers":totalSubscribers,"totalVideos":totalVideos,"totalVideoLikes":totalVideoLikes,"totalCommentLikes":totalCommentLikes,"totalTweetLikes":totalTweetLikes,"totalPlaylists":totalPlaylists,"videos":videos,"playlists":playlists}))



})

export {getChannelVideos,getChannelStats}
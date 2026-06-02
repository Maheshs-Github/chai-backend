import { Tweet } from "../models/tweets.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";``


const addTweet=asyncHandler(async(req,res)=>{
  const userId=req.user?._id;
  console.log("usrID: ",userId);
  const {content}=req.body;

  if (!userId || !content.trim())
    throw new ApiError(400,"Both User Id and Content is Required");

  const tweet=await Tweet.create({content,owner:userId})


  return res.status(201).json(new ApiResponse(201,tweet,"Tweet has been Posted Successfully"))
})

const getTweet=asyncHandler(async(req,res)=>{
  const {tweetId}=req.params;

  if(!tweetId)
    throw new ApiError(400,"Tweet Id is Missing ")

  const tweet=await Tweet.findById(tweetId).select("-updatedAt -createdAt");

  if(!tweet)
    throw new ApiError(404,"Tweet Not Found");

  return res.status(200).json(new ApiResponse(200,tweet,"Tweet Fetched Successfully"))
})

const updateTweet=asyncHandler(async(req,res)=>{
  const {tweetId}=req.params;
  const {content}=req.body;
  if(!tweetId || !content.trim())
    throw new ApiError(400," Tweet Id & Content are both Required");

  const tweet=await Tweet.findByIdAndUpdate(tweetId,{$set:{content}},{new:true}).select("-_id -createdAt -updatedAt")

  if(!tweet)
    throw new ApiError(404,"No Tweet is found ")

  return res.status(200).json( new ApiResponse(200,tweet,"Tweet has been Updated Successfully"))
})

const deleteTweet=asyncHandler(async(req,res)=>{
  const {tweetId}=req.params;
  if(!tweetId)
    throw new ApiError(400,"Tweet Id is missing ")

  const tweet=await Tweet.findByIdAndDelete(tweetId);

  if(!tweet)
    throw new ApiError(404,"No Tweet is found");

  return res.status(200).json(new ApiResponse(200,tweet,"Tweet has been deleted successfully"))

})

export {addTweet,getTweet,updateTweet,deleteTweet}
import { Comment } from "../models/comments.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addComment=asyncHandler(async(req,res)=>{
  const {content}=req.body;
  const {videoId}=req.params;
  console.log("owner: ",req.user?._id)

  console.log("content: ",content," videoId: ",videoId)
  if(!(content && videoId))
    throw new ApiError(400,"Content or video id is missing")

  const comment=await Comment.create({
    content,
    video:videoId,
    owner:req.user?._id,
  })
  console.log("commnet: ",comment)
  // no need for this error handling as mongoose will do it , itself 
  // if(!comment)
  //   throw new ApiError(500,"Error while Adding the Commnet")

  return res.status(201).json(new ApiResponse(201,comment,"Comment has been Added Successfully"))
})


const updateComment=asyncHandler(async(req,res)=>{
  const {commentId}=req.params;
  const {content}=req.body;
  // if(!(commentId && content))
  if (!commentId || !content?.trim())
    throw new ApiError(400,"Commnet Id or Content is missing")
    
  const comment=await Comment.findByIdAndUpdate(commentId,{$set:{content}},{new:true})

  if(!comment)
    throw new ApiError(404,"Commnet Not Found, Ensure correct & Valid ID");

  return res.status(200).json(new ApiResponse(200,comment,"Commnet has been updated Succesfully"))
})

const getComment=asyncHandler(async(req,res)=>{
  const {commentId}=req.params;

  if(!commentId)
    throw new ApiError(400,"Comment ID is Missing ")

  const comment =await Comment.findById(commentId);

    if(!comment)
    throw new ApiError(404,"Commnet Not Found, Ensure correct & Valid ID");


  return res.status(200).json(new ApiResponse(200,comment,"Commnet is Fetched Successfully"))
})

const deleteComment=asyncHandler(async(req,res)=>{
  const {commentId}=req.params;

  if(!commentId)
    throw new ApiError(400,"Comment Id is Missing")

  const comment=await Comment.findByIdAndDelete(commentId);
  if(!comment)
    throw new ApiError(404,"Comment Not Found");
  
  // 204 status code is for the no contnet for delete , but for 204 we can't send the reposne there 
  // return res.status(204).send();

  return res.status(200).json(new ApiResponse(200,comment,"Comment has been Deleted Successfully"))


})

const getVideoComments=asyncHandler(async(req,res)=>{
  const {videoId}=req.params;

  const {page=1,limit=2}=req.query;

  console.log("req.query: ",req.query)

  if(!videoId)
    throw new ApiError(400,"No Comment ID is provided")

  const skip=(Number(page)-1)*Number(limit);
  const comments=await Comment.find({video:videoId}).skip(skip).limit(Number(limit))

  if(!comments)
    throw new ApiError(404,"Comments Not Found")

  return res.status(200).json(new ApiResponse(200,comments,"Comments has been fetched Successfully"))
})
export {addComment,updateComment,getComment,deleteComment,getVideoComments}
import { Subscription } from "../models/subscriptions.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const getChannelSubscribedTo=asyncHandler(async(req,res)=>{
  const channelSubscribedToList=await Subscription.find({subscriber:req.user?._id}).populate("channel");
  // console.log("channelSubscribedToList: ",channelSubscribedToList)
  if(channelSubscribedToList.length===0)
    throw new ApiError(404,"Not FOund any channel which current user channel is subscribed to ");
  
  return res.status(200).json(new ApiResponse(200,channelSubscribedToList,"Channel Subscribed to list fetched successfully"))
})

const toggleSubsription=asyncHandler(async(req,res)=>{
  const {channelId}=req.params;

  if(!channelId)
    throw new ApiError(400,"Channel Id id missing");

  const subscription=await Subscription.findOne({subscriber:req.user?._id,channel:channelId});

  console.log("subscription: ",subscription);
  let isSubscription;
  if(subscription){
    await Subscription.findOneAndDelete({subscriber:req.user?.id,channel:channelId})
    isSubscription=false;
  }
  else{
    await Subscription.create({subscriber:req.user?.id,channel:channelId})
    isSubscription=true;
  }
  return res.status(200).json(new ApiResponse(200,{isSubscribed:isSubscription},"Subscription status has been updated successfully"));
})

const getChannelSubscribers=asyncHandler(async(req,res)=>{
  console.log("req.user?._id: ",req.user?._id);
  const subscribersOfChannel=await Subscription.find({channel:req.user?._id}).populate("subscriber");
  console.log("subscribersOfChannel: ",subscribersOfChannel);
  if(subscribersOfChannel.length===0)
    throw new ApiError(404,"No Subscribers to the channel has been found")

  return res.status(200).json(new ApiResponse(200,subscribersOfChannel,"Subscribers has been fetched Successfully"))
})

export {toggleSubsription,getChannelSubscribers,getChannelSubscribedTo}

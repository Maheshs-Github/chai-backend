import { Playlist } from "../models/playlists.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createPlaylist=asyncHandler(async(req,res)=>{
  const {name,description}=req.body;

  if(!name || !description)
    throw new ApiError(400,"Both Name and Description are required")

  const playlist=await Playlist.create({name,description,owner:req.user?._id})
  return res.status(201).json(new ApiResponse(201,playlist,"Playlist has been Successfully created"))
})

const addVideoIntoPlaylist=asyncHandler(async(req,res)=>{
  const {playlistId}=req.params;

    const {videoId}=req.params;
  if(!videoId || !playlistId)
    throw new ApiError(400,"Video Id or playlist Id is Missing ")


  // here we are having 2 DB call 1 for fetching the Playlist to check if the playlist owner and second the update the new video into, but we can do it with 1 too 
  // const playlistData=await Playlist.findById(playlistId)

  //   if(!playlistData)
  //   throw new ApiError(404,"playList is not Found")
  // console.log("playlistData.owner: ",playlistData.owner," req.user._id: ",req.user._id)
  
  // if(playlistData.owner.toString()!==req.user._id.toString())
  //   throw new ApiError(403,"You can only update playlist which are created by u")

  // const playlist=await Playlist.findByIdAndUpdate(playlistId,{$addToSet:{videos:videoId}},{new:true})


  // The thing is simple actually , in 2nd db call we are passing the playlist id and video id, in first one too, but if we have to just check the current usere we can just the user id with the playlist id, so only if we have the same user id and playlist id of same documnet tat will be written 
  // bascialy we are checking the both of them , in a singkle call, no need to check differently 

  const playlist=await Playlist.findOneAndUpdate({_id:playlistId,owner:req.user?._id},{$addToSet:{videos:videoId}},{new:true})

  if(!playlist)
    throw new ApiError(404,"No Playlist Found or Unautrized Request") 


  return res.status(200).json(new ApiResponse(200,playlist,"Video has been added into the Playlist"))

})

const getUserPlayLists=asyncHandler(async(req,res)=>{
  const userPlaylists=await Playlist.find({"owner":req.user?._id});
  if(userPlaylists.length===0)
    throw new ApiError(404,"No Playlists Found")

  return res.status(200).json(new ApiResponse(200,userPlaylists,"User Playlists has been Fetched Successfully"))
})

const getPlayListById=asyncHandler(async(req,res)=>{
  const {playlistId}=req.params;
  if(!playlistId)
    throw new ApiError(400,"No PlayList Id is Found");

  const playlist=await Playlist.findById(playlistId);

  if(!playlist)
    throw new ApiError(404,"Not Playlist Found");

  return res.status(200).json(new ApiResponse(200,playlist,"Playlist is Fetched Successfully"))
})

const deletePlaylist=asyncHandler(async(req,res)=>{
  const {playlistId}=req.params;

  if(!playlistId)
    throw new ApiError(400,"PlayList Id is Missing ")

  const playList=await Playlist.findByIdAndDelete(playlistId);

  if(!playList)
    throw new ApiError(404,"No Playlist Found");

  return res.status(204).json(new ApiResponse(204,{},"Playlist has been deleted successfully"))
})

const updatePlaylist=asyncHandler(async(req,res)=>{
  const {name,description}=req.body;
  const {playlistId}=req.params;

  if(!playlistId)
    throw new ApiError(400,"No playlist id is found");

  if(!name && !description)
    throw new ApiError(400,"name or description shoulkd be added to update")

  const fields={}
  if (name!==undefined) fields.name=name;
  if (description!==undefined) fields.description=description;
  const updatedPlaylist=await Playlist.findByIdAndUpdate(playlistId,{$set:fields},{new:true});
  console.log("updatedPlaylist: ",updatedPlaylist,"Also firlds: ",fields)

  if(!updatedPlaylist)
    throw new ApiError(404,"No Playlist Found")

  return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Playlist has been updated Successfully"))
})

const removeVideoFromPlaylist=asyncHandler(async(req,res)=>{
  const {playlistId,videoId}=req.params;
  console.log("playlistId,videoId: ",playlistId,videoId);
  if(!playlistId || !videoId)
    throw new ApiError(400,"Playlist Id and Video Is reuired");

  const playlist=await Playlist.findById(playlistId);
  console.log("playlist: ",playlist);
  if(!playlist)
    throw new ApiError(404,"PlayList not found");

  console.log("playlist.videos: ",playlist.videos)

  if(!playlist.videos.includes(videoId))
    throw new ApiError(404,"Video not found");

  const removedFromPlaylist=await Playlist.findByIdAndUpdate(playlistId,{$pull:{videos:videoId}},{new:true})

  console.log("removedFromPlaylist: ",removedFromPlaylist);

  if(!removedFromPlaylist)
    throw new ApiError(404,"No PlayList Found");

  return res.status(200).json(new ApiResponse(200,removedFromPlaylist,"Video has been Successfully Removed from the Playlist"));
})

export {createPlaylist,addVideoIntoPlaylist,getUserPlayLists,getPlayListById,deletePlaylist,updatePlaylist,removeVideoFromPlaylist}
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description, duration, views, isPublished } = req.body;

  if (
    [title, description, duration, views, isPublished].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All Fields Required");
  }

  console.log("req.files: ", req.files);
  console.log("req.body: ", req.body);

  if (
    !(
      req.files &&
      req.files?.videoFile[0] &&
      Array.isArray(req.files.videoFile) &&
      req.files?.thumbnail[0] &&
      Array.isArray(req.files?.thumbnail)
    )
  )
    throw new ApiError(400, "Video File & It's Thumbnail is Required");

  const videoURL = await uploadOnCloudinary(req.files.videoFile[0]?.path);
  const thumbnailURL = await uploadOnCloudinary(req.files.thumbnail[0]?.path);
  console.log("videoURL: ", videoURL, "thumbnailURL: ", thumbnailURL);

  const createdVideo = await Video.create({
    title,
    description,
    duration,
    views,
    isPublished,
    videoFile: videoURL.url,
    thumbnail: thumbnailURL.url,
    owner:req.user?._id,
  });
  if (!createdVideo) throw new ApiError(500, "Error while Creatng the Video");
  console.log("createdVideo: ", createdVideo);

  return res
    .status(200)
    .json(
      new ApiResponse(200, createdVideo, "Video has been uploaded successfully")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId?.trim()) throw new ApiError(400, "No Id Found");

  const video = await Video.findById(videoId).select(
    "-_id -createdAt -updatedAt"
  );

  if (!video) throw new ApiError("No Video found with given Id");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video has been  Fetched Successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId?.trim()) throw new ApiError(400, "No id is found");

  console.log("id: ", videoId);

  const { title, description, duration, views, isPublished } = req.body;
  // const {videoFile,thumbnail}=req.files;

  const updatefields = {};
  if (title !== undefined) updatefields.title = title;
  if (description !== undefined) updatefields.description = description;
  if (duration !== undefined) updatefields.duration = duration;
  if (views !== undefined) updatefields.views = views;
  if (isPublished !== undefined) updatefields.isPublished = isPublished;

  console.log("req.body: ", req.body, " req.files: ", req.files);

  // console.log("req.files?.thumbnail: ", req.files?.path);

  console.log("req.files.lenght: ", req.files.length);
  if (req.files.length !== 0) {
    let videoPath, thumbnailPath;
    for (let file of req.files) {
      console.log("file: ", file);
      if (file?.fieldname == "videoFile") videoPath = file.path;
      else if (file?.fieldname == "thumbnail") thumbnailPath = file.path;
    }
    console.log("videoPath: ", videoPath, " thumbnailPath: ", thumbnailPath);

    // let videoUrl;
    // let thumnailUrl;
    // We are using the sequential approch here
    // if(videoPath)
    //   videoUrl=await uploadOnCloudinary(videoPath)
    // if(thumbnailPath)
    //   thumnailUrl=await uploadOnCloudinary(thumbnailPath)

    // parallel approch
    const [videoUrl, thumnailUrl] = await Promise.all([
      videoPath ? uploadOnCloudinary(videoPath) : null,
      thumbnailPath ? uploadOnCloudinary(thumbnailPath) : null,
    ]);

    console.log("videoUrl: ", videoUrl, " thumnailUrl: ", thumnailUrl);
    if (!(videoUrl || thumnailUrl))
      throw new ApiError(500, "Error While uploading the Images or Files ");

    if(videoUrl) updatefields.videoFile = videoUrl.url;
    if (thumnailUrl) updatefields.thumbnail = thumnailUrl.url;
  }

  console.log("updatefields: ", updatefields);

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: updatefields,
    },
    { new: true }
  );

  if (!video) throw new ApiError(500, "There was Error WHile Updating");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video has been updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  console.log("videoId: ", videoId);
  if (!videoId) throw new ApiError(400, "Id is Missing ");

  const video = await Video.findOneAndDelete(videoId);

  if (!video) throw new ApiError(500, "Error while Deleting the Video");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video has been deleted Successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) throw new ApiError(400, "Id is Missing ");

  console.log("videoId: ", videoId);

  // This approch works too, but it needs to DB call one to to fetch the data and  2nd to update
  // const video=await Video.findById(videoId)
  // console.log(("video: ",video))
  // console.log(("video.isPublished: ",video?.isPublished))
  // const isPublishStatus=video?.isPublished
  // const upadtedVideo=await Video.findByIdAndUpdate(videoId,{$set:{isPublished:!isPublishStatus}},{new:true})

  // with this approch we can do it in a single DB call , actually our problem was we were not getting the values of isPublished , but mongo do it internaly with $
  const upadtedVideo = await Video.findByIdAndUpdate(
    videoId,
    [{ $set: { isPublished: { $not: "$isPublished" } } }],
    { new: true, updatePipeline: true }
  );

  if (!upadtedVideo) throw new ApiError(500, "Error while updating the Status");

  return res
    .status(200)
    .json(
      new ApiResponse(200, upadtedVideo, "Status has been Updated Successfully")
    );
});

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 2,
    query,
    sortBy = "createdAt",
    sortType = "asc",
  } = req.query;

  console.log("req.query: ", req.query);

  const filter = {};
  if (query) {
    filter.title = { $regex: query, $options: "i" };
  } //if we have the title as a what is given in a query="react"

  const sort = {};
  sort[sortBy] = sortType === "asc" ? 1 : -1;
  // createdAt:1

  const skip = (page - 1) * limit;
  // fo 1st page (1-1)*10=10
  const videos = await Video.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit));

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos has been Fetched Successfully"));
});

export {
  getAllVideos,
  uploadVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

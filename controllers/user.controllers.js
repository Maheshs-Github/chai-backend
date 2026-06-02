import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.models.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    // console.log("user: ",user);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    //     console.log("accessToken: ",accessToken);
    // console.log("refreshToken: ",refreshToken);

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while crateing the Refersh and Access Tokens"
    );
  }
};
const registerUser = asyncHandler(async (req, res) => {
  // res.status(200).json({
  //   message:"Hi, Hola, Konichiwa, okay baye then..."
  // })

  // get user details from frontend
  // validation - not empty
  // check if already exists:userName , email
  // check for images and avatar
  // upload the image and avatar on cloudinary
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check fro user creation
  // return teh response or error

  const { userName, fullName, email, password } = req.body;
  // console.log("UserNAme: ",userName)

  // if(fullName==="" || )
  //   throw new ApiError(400,"fullNAme is required")
  // console.log(
  //   "[fullName,email,userName,password].some((field)=>field?.trim() ===",
  //   [fullName, email, userName, password].some(
  //     (field) => !field || field?.trim() === ""
  //   )
  // );
  if (
    [fullName, email, userName, password].some(
      (field) => !field || field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with Same Email or userName Alredy Exists ");
  }

  console.log("req.files: ", req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files?.coverImage) &&
    req.files?.coverImage[0]
  )
    coverImageLocalPath = req.files?.coverImage[0]?.path;

  console.log(
    "Avatar: ",
    avatarLocalPath,
    " coverImage: ",
    coverImageLocalPath
  );

  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  console.log("avatar: ", avatar);

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  console.log("User: ", user);

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken "
  );

  console.log("created User: ", createdUser);

  if (!createdUser) {
    throw new ApiError(500, "Something Went Wrong while Registering the User");
  }

  console.log(
    "UserNAme: ",
    userName,
    "email: ",
    email,
    "fullName: ",
    fullName,
    "password: ",
    password
  );

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // TO Do List
  // req body - data
  // usrname or email to check the user
  // check the user
  // match teh password
  // access ot refresh token
  // send cookie

  const { userName, email, password } = req.body;
  if (!userName && !email)
    throw new ApiError(400, "UserName or Password is Required");

  // console.log("Req.body: ",req.body)

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (!user) throw new ApiError(404, "User Does Not Exists");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) throw new ApiError(401, "Invalid User Password");

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  //       console.log("accessToken: ",accessToken);
  // console.log("refreshToken: ",refreshToken);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "User Logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refershToken: undefined },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

const refershAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) throw new ApiError(401, "Unauthrized Request");

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    console.log("decodedToken?._id: ", decodedToken?._id);

    const user = await User.findById(decodedToken?._id);
    console.log("User :", user?.email);

    if (!user) throw new ApiError(401, "Invlaid Refresh Token");

    console.log(
      "Refresh Incom:",
      incomingRefreshToken,
      " user: ",
      user?.refreshToken
    );
    if (incomingRefreshToken !== user?.refreshToken)
      throw new ApiError(401, "Refresh Token is not matched or Expired");

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    console.log("accessToken: ", accessToken);
    console.log("refreshToken: ", refreshToken);

    return res
      .status(200)
      .cookie("accessToken", accessToken)
      .cookie("refreshToken", refreshToken)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access Token is Generated"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confPassword } = req.body;

  if (newPassword !== confPassword)
    throw new ApiError(400, "New Password and Confirm Password Do not match");

  const user = await User.findById(req.user?._id);

  const isPasswordCorrectt = user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrectt) throw new ApiError(400, "Invalid Old Password");
  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password has been Chnaged Successfully "));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  console.log("req.user: ",req.user)
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current SUer Fetched Succesfully "));
});

const upadteAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  console.log("req.body: ",req.body)
  console.log("fullName: ", fullName, " email: ", email);

  if (!fullName || !email) throw new ApiError(400, "All Fields are Required");

  const user =await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email, // let's see if we need the as object or just name as the key and values are the same
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account Details Updated Successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file.path;

  if (!avatarLocalPath) throw new ApiError(400, "Avatar File is Missing");

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url)
    throw new ApiError(400, "Error Whlile Uploading FIle on Cloudinary");

  const userOld = await User.findById(req.user?._id);
  console.log("UserOld: ", userOld);
  if (userOld.avatar) {
    await deleteFromCloudinary(userOld?.avatar);
  }

  console.log("New Avatar Obj: ", avatar);

  // User.avatar=avatar
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avatar.url } },
    { new: true }
  ).select("-password");
  console.log("user: ",user)

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar Has been Updated Succesfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file.path;
  if (!coverImageLocalPath)
    throw new ApiError(400, "Cover Image File is Missing ");
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url)
    throw new ApiError(400, "There is Error while Upoloading the Cover Image ");

  const userOld = await User.findById(req.user?._id);
  if (userOld.coverImage) await deleteFromCloudinary(userOld?.coverImage);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { coverImage: coverImage.url } },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Iamge is Succesfully Updated"));
});

const getuserChannelProfile = asyncHandler(async (req, res) => {
  const { userName } = req.params;
  if (!userName?.trim()) throw new ApiError(400, "Username is Missing ");

  const channel = await User.aggregate([
    {
      $match: {
        userName: userName?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        userName: 1,
        fullName: 1,
        subscriberCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (channel?.length===0) throw new ApiError(404, "Channel Does not Exists");
  console.log("hannel[0]: ",channel)

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User Channel Fetched Successfully ")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    userName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch History Fetched Successfully"
      )
    );
});
export {
  registerUser,
  loginUser,
  logoutUser,
  refershAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  upadteAccountDetails,
  updateUserAvatar,
  updateCoverImage,
  getuserChannelProfile,
  getWatchHistory,
};

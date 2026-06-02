import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getuserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refershAccessToken,
  registerUser,
  upadteAccountDetails,
  updateCoverImage,
  updateUserAvatar,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
// https:localhost:8000/api/v1/register
router.route("/login").post(loginUser);

// Secured Routes
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refershAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-accountDeatils").patch(verifyJWT, upadteAccountDetails);
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/coverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);
router.route("/c/:userName").get(verifyJWT, getuserChannelProfile);
router.route("/watchHistory").get(verifyJWT, getWatchHistory);

export default router;

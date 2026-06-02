import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, togglePublishStatus, updateVideo, uploadVideo } from "../controllers/video.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router=Router();

router.use(
  verifyJWT
)

router.route("/upload-video").post(
  upload.fields([
    {name:"videoFile",maxCount:1},
    {name:"thumbnail",maxCount:1},

  ]),uploadVideo
);
router.route("/v/:videoId").get(getVideoById);
router.route("/v/:videoId").patch(upload.any(),updateVideo);
router.route("/v/:videoId").delete(deleteVideo);
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);
router.route("/get-videos").get(getAllVideos);
 

export default router;
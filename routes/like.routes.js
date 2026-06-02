import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedComments, getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../controllers/like.controllers.js";


const router=Router();

router.use(verifyJWT);

router.get("/videos",getLikedVideos)
router.get("/comments",getLikedComments)
router.post("/videos/:videoId",toggleVideoLike)
router.post("/tweets/:tweetId",toggleTweetLike)
router.post("/comments/:commentId",toggleCommentLike)



export default router;
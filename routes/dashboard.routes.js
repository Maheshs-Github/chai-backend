import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelStats, getChannelVideos } from "../controllers/dasboard.controllers.js";


const router=Router()

router.use(verifyJWT)

router.get("/channelVideos",getChannelVideos);
router.get("/channelStats",getChannelStats);

export default router;
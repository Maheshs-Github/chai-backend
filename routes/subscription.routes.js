
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getChannelSubscribedTo, getChannelSubscribers, toggleSubsription } from "../controllers/subscription.controllers.js";


const router=Router();

router.use(verifyJWT)

router.get("/channel/subscribers",getChannelSubscribers);
router.get("/channel/subscribedTo",getChannelSubscribedTo);
router.patch("/toggle/:channelId",toggleSubsription);

export default router;
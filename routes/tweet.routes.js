import { Router } from "express";
import { addTweet, deleteTweet, getTweet, updateTweet } from "../controllers/tweet.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.use(verifyJWT)

router.post("/",addTweet)
router.get("/:tweetId",getTweet)
router.patch("/:tweetId",updateTweet)
router.delete("/:tweetId",deleteTweet)

export default router;
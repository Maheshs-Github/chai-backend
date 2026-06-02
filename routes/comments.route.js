import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getComment, getVideoComments, updateComment } from "../controllers/comment.controllers.js";


const router=Router();

router.use(verifyJWT)


// router.route("/c/:videoId/addComment").post(addComment)
// router.route("/c/:commentId/updateComment").patch(updateComment)
// router.route("/c/:commentId/getComment").get(getComment)
// router.route("/c/:commentId/deleteComment").delete(deleteComment)
// router.route("/c/:videoId/getComments").get(getVideoComments)

router.post("/videos/:videoId",addComment)
router.get("/videos/:videoId",getVideoComments)
router.get("/:commentId",getComment)
router.patch("/:commentId",updateComment)
router.delete("/:commentId",deleteComment)


export default router;
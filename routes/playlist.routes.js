import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoIntoPlaylist, createPlaylist, deletePlaylist, getPlayListById, getUserPlayLists, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controllers.js";


const router=Router();

router.use(verifyJWT)


router.post("/",createPlaylist)
router.get("/:playlistId",getPlayListById)
router.delete("/:playlistId",deletePlaylist)
router.patch("/:playlistId",updatePlaylist)

router.patch("/:playlistId/:videoId",addVideoIntoPlaylist)
router.delete("/:playlistId/:videoId",removeVideoFromPlaylist)
router.get("/user",getUserPlayLists)

export default router;
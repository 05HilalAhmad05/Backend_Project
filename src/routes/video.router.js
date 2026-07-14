import { Router } from "express";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    deleteVideo,
    updateVideo,
    togglePublishStatus
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
// here we apply verify jwt for all the routes in this router
router.use(verifyJWT)

router.route("/")
    .get(getAllVideos)
    .post(upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]), publishAVideo)

router.route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo)

router.route("/toggle/publish/:videoId")
    .patch(togglePublishStatus)

export default router

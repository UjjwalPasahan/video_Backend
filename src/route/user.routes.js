import { Router } from "express";
import { loginUser, logOut, refreshAccessToken, registerUser,changeCurrentPassword,getCurrentUser,updateAccountDetails,updateCoverImage,updateAvatarImage,getUserChannelProfile,getWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImg', maxCount: 1 }
]), registerUser);

router.route("/login").post(loginUser);
router.route("/logout").get(verifyJwt , logOut);
router.route("/refresh-token").get(refreshAccessToken);
router.route("/change-password").post(verifyJwt, changeCurrentPassword)
router.route("/current-user").get(verifyJwt, getCurrentUser)
router.route("/update-account").patch(verifyJwt, updateAccountDetails)

router.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateAvatarImage)
router.route("/cover-image").patch(verifyJwt, upload.single("coverImg"), updateCoverImage)

router.route("/c/:username").get(verifyJwt, getUserChannelProfile)
router.route("/history").get(verifyJwt, getWatchHistory)

export default router;

import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  currentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchedHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.js";
import { verifyJWT } from "../middlewares/auth.js";

const router = Router();

router.route("/register").post(
  // Public Route
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser); // Public Route

//Secure Route
router.route("/logout").post(verifyJWT, logoutUser); // Here we use verifyJWT middleware to protect the logout route
router.route("/refresh-token").post(refreshAccessToken); // Public Route to refresh access token   , we have made an end point for refreshing access token
router.route("/change-password").post(verifyJWT, changeCurrentPassword); // Secure Route to change current password

router.route("/current-user").get(verifyJWT, (req, res) => {
  res.status(200).json({ data: req.user });
}); // Secure Route to get current logged in user info

router.route("/update-account").patch(verifyJWT, updateAccountDetails); // Secure Route to update user account details

router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar); // Secure Route to update user avatar

router
  .route("/update-cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage); // Secure Route to update user cover image

router.route("/watched-history").get(verifyJWT, getWatchedHistory); // Secure Route to get user's watched history

router.route("/:username").get(getUserChannelProfile); // Public Route to get user channel profile by username

export default router;

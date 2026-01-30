import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { VIDEO } from "../models/video.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }
  const existedLike = await Like.findOne({
    targetModel: "VIDEO",
    target: videoId,
    owner: userId,
  });
  if (existedLike) {
    await Like.deleteOne({ _id: existedLike._id });
    return res.status(200).json(new ApiResponse(200, { liked: false }));
  } else {
    await Like.create({
      targetModel: "VIDEO",
      target: videoId,
      owner: req.user._id,
    });
  }
  res.status(200).json(new ApiResponse(200, { liked: true }));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };

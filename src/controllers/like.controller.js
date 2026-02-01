import mongoose, { isValidObjectId } from "mongoose";
import { LIKE, Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { VIDEO } from "../models/video.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  const video = await VIDEO.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  const existingLike = await LIKE.findOne({
    video: videoId,
    likedby: userId,
  });
  if (existingLike) {
    await LIKE.deleteOne({ _id: existingLike._id });
  } else {
    await LIKE.create({ video: videoId, likedby: userId });
  }
  res.status(200).json(new ApiResponse(200, " Like Toggled Successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const  userId   = req.user._id;
  //TODO: toggle like on comment
  const existingLike = await LIKE.findOne({
    comment: commentId,
    likedby: userId,
  });
  if (existingLike) {
    await LIKE.findOneAndDelete({
      comment: commentId,
      likedby: userId,
    });
  } else {
    await LIKE.create({ comment: commentId, likedby: userId });
  }
  res.status(200).json({
    status: 200,
    message: "Like Toggled Successfully",
  });
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };

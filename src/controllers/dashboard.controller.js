import mongoose from "mongoose";
import { VIDEO, Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { LIKE, Like } from "../models/like.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const channelId = req.user._id;
  const [viewStats, subscriberCount, videoCount, likeCount] =
    await Promise.all();
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const { channelId } = req.params;
});

export { getChannelStats, getChannelVideos };

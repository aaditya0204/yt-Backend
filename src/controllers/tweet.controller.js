import mongoose, { isValidObjectId } from "mongoose";
import { TWEET, Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, " Please tweeet Something");
  }
  const tweet = await TWEET.create({
    content,
    owner: req.user._id,
  });
  res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet Created Successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const userId = req.user._id;
  const allTweets = await TWEET.find({ owner: userId });
  if (allTweets.length == 0) {
    throw new ApiError(400, "Tweets Not Found ");
  }
  res
    .status(200)
    .json(new ApiResponse(200, allTweets, "    Users Tweets Fetched"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { content } = req.body;
  const { tweetId } = req.params;
  if (!content) {
    throw new ApiError(400, "Please provide content to update tweet");
  }
  const tweet = await TWEET.findOneAndUpdate(
    {
      _id: tweetId,
      owner: req.user._id,
    },
    {
      content,
    },
    { new: true }
  );
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet Updated Successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const deletedtweet = await TWEET.findOneAndDelete({
    _id: tweetId,
    owner: req.user._id,
  });
  if (!deletedtweet) {
    throw new ApiError(400, " Tweet Not Found ");
  }
  res.status(200).json(new ApiResponse(200, " Tweet deleted Successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };

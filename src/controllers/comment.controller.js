import mongoose from "mongoose";
import COMMENT from "../models/comment.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  
  // const comments = await COMMENT.find({ video: videoId });
  //          OR
  const comments = await COMMENT.aggregate([
    {
      $match: { video: videoId },
    },
  ]);
  res
    .status(200)
    .json(new ApiResponse(200, { results: comments.length, comments }));
});

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;

  if (!content) {
    throw new ApiError(400, "Please Enter Comment");
  }
  if (!videoId) {
    throw new ApiError(400, "Video Id  is Required ");
  }
  const addedComment = await COMMENT.create({
    content,
    video: videoId,
    owner: req.user._id,
  });
  res
    .status(200)
    .json(new ApiResponse(200, addedComment, "Commented Successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;

  if (!content) {
    throw new ApiError(400, "Please add comment");
  }

  const updatedComment = await COMMENT.findOneAndUpdate(
    { _id: commentId, owner: req.user._id },
    {
      content,
    },
    {
      new: true,
    }
  );
  if (!updatedComment) {
    throw new ApiError(400, " Please add Comment");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, updatedComment, " Comment updated Succssfully ")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const deletedComment = await COMMENT.findOneAndDelete({
    _id: commentId,
    owner: req.user._id,
  });
  if (!deletedComment) {
    throw new ApiError(404, "Comment is not deleted or Not Authorised ");
  }
  res.status(200).json(new ApiResponse(200, "Comment Deleted Succesfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };

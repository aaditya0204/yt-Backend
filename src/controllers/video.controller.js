import mongoose, { isValidObjectId } from "mongoose";
import { VIDEO } from "../models/video.model.js";
import { USER } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadonCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort,

  const match = {};
  if (userId && isValidObjectId(userId)) {
    match.owner = new mongoose.Types.ObjectId(userId);
  }
  if (query) {
    match.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  const sortOptions = {};
  if (sortBy && sortType) {
    sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const videos = await Video.aggregate([
    { $match: match },
    { $sort: sortOptions || { createdAt: -1 } },
    { $skip: skip },
    { $limit: limitNum },
  ]);

  const totalVideos = await Video.countDocuments(match);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, totalVideos, page: pageNum, limit: limitNum },
        "Videos fetched successfully"
      )
    );
}); // Practice More THIS !!!

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    throw new ApiError(400, "Title is required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "Video file is required");
  }

  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const videoResponse = await uploadOnCloudinary(videoLocalPath);
  if (!videoResponse?.secure_url) {
    throw new ApiError(400, "Video uploading failed");
  }

  const thumbnailResponse = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnailResponse?.secure_url) {
    throw new ApiError(400, "Thumbnail uploading failed");
  }

  const video = await VIDEO.create({
    title,
    description,
    videoFile: videoResponse.secure_url,
    thumbnail: thumbnailResponse.secure_url,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const updatedVideo = await VIDEO.findById(videoId);
  if (!updatedVideo) {
    throw new ApiError(404, "Video not found");
  }

  if (updatedVideo.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not allowed");
  }

  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;

  const updatedVideoPath = req.files?.videoFile?.[0]?.path;
  if (updatedVideoPath) {
    const uploadedVideoResponse = await uploadOnCloudinary(updatedVideoPath);
    if (!uploadedVideoResponse?.secure_url) {
      throw new ApiError(400, "Video uploading failed");
    }
    updateFields.videoFile = uploadedVideoResponse.secure_url;
  }

  const updatedThumbnailPath = req.files?.thumbnail?.[0]?.path;
  if (updatedThumbnailPath) {
    const uploadedThumbnailResponse =
      await uploadOnCloudinary(updatedThumbnailPath);
    if (!uploadedThumbnailResponse?.secure_url) {
      throw new ApiError(400, "Thumbnail uploading failed");
    }
    updateFields.thumbnail = uploadedThumbnailResponse.secure_url;
  }

  if (Object.keys(updateFields).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }

  const finalVideo = await VIDEO.findByIdAndUpdate(videoId, updateFields, 
    {
    new: true,
  });

  res
    .status(200)
    .json(new ApiResponse(200, finalVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

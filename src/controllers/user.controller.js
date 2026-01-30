import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { USER } from "../models/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { verifyJWT } from "../middlewares/auth.js";
import jwt from "jsonwebtoken";
import { set } from "mongoose";

const generateAccessAndrefreshToken = async (userId) => {
  try {
    const user = await USER.findById(userId);
    const accToken = await user.generateAccessToken();
    const refToken = await user.generateRefreshToken();

    user.refreshToken = refToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken: accToken, refreshToken: refToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating refresh and access token "
    );
  }
};
// Register User
const registerUser = asyncHandler(async (req, res) => {
  // Get User Details from frontEnd
  // Validation(not Empty)
  // If User already exists, dont add again
  // if Doesnt exist then add
  // check for images , check for avatar
  // upload to cloudinary
  // Check if avatar is auccessfully uploaded by multer and cloudinary
  // create user object -  create entry in DB
  // remove password and refresh token fields from response
  // check for user creation
  // return response

  const { fullname, username, email, password } = req.body || {};

  if (
    [fullname, email, username, password].some(
      (field) => !field || field.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await USER.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email/username already exists");
  }
  console.log(req.files);

  const avatarLocalpath = req.files?.avatar?.[0]?.path;
  const coverImageLocalpath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar image is required");
  }
  const avatarUploadResponse = await uploadonCloudinary(avatarLocalpath);

  if (!avatarUploadResponse?.secure_url) {
    throw new ApiError(400, "Avatar upload failed");
  }

  let coverImageUploadResponse;
  if (coverImageLocalpath) {
    coverImageUploadResponse = await uploadonCloudinary(coverImageLocalpath);
  }
  const user = await USER.create({
    fullname,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatarUploadResponse.secure_url,
    coverImage: coverImageUploadResponse?.secure_url || "",
  });

  const createdUser = await USER.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User Registration Failed");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User Created!"));
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  // Get email and password from req.body
  // username or email
  // validation
  // check if user exists with given email
  // if exists, verify password
  // if password correct, generate access token
  // return user details without password and refresh token along with access token

  const { username, email, password } = req.body;
  if (!username && !email) {
    throw new ApiError(400, " Username or email is required");
  }

  const user = await USER.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new ApiError(401, "User with this  email or username doesn't exist");
  }
  const validPassword = await user.isPasswordCorrect(password);

  if (!validPassword) {
    throw new ApiError(401, "Password is incorrect");
  }

  // const accToken = await user.generateAccessToken();
  // const refToken = await user.generateRefreshToken();

  const { accessToken, refreshToken } = await generateAccessAndrefreshToken(
    user._id
  );

  const loggedUser = await USER.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    // This means cookie is only modifyable from server , frontend can even touch it
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "User Logged In successfully"
      )
    );
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  req.user._id;
  await USER.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
    expires: new Date(0),
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User Logged Out Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Please login again");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await USER.findById(decodedToken._id);
    if (!user || incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const { accessToken, refreshToken } = await generateAccessAndrefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, { success: true }, "Token refreshed"));
  } catch (error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  const user = UserActivation.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Old password");
  }

  user.password = newPassword;
  user.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Yeah Password changed Successfully "));
});

const currentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(200, req.user, "current User Fetced Succesfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email, username } = req.body;
  if (!fullname || !email || !username) {
    throw new ApiError(400, "All fields are required");
  }

  const updatedUser = await USER.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullname,
        email,
        username,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Account details updated successfully")
    );
});

const updateAvatar = asyncHandler(async (req, res) => {
  req.files?.avatar?.[0]?.path;
  const avatarLocalpath = req.files?.avatar?.[0]?.path;
  if (!avatarLocalpath) {
    throw new ApiError(400, "Avatar image is required");
  }
  const avatarUploadResponse = await uploadonCloudinary(avatarLocalpath);
  if (!avatarUploadResponse?.secure_url) {
    throw new ApiError(400, "Avatar upload failed");
  }
  let updatedUser = await USER.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatarUploadResponse.secure_url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");
  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Avatar updated successfully"));
});

const updateCoverImage = asyncHandler(async (req, res) => {
  req.files?.coverImage?.[0]?.path;
  const coverImageLocalpath = req.files?.coverImage?.[0]?.path;
  if (!coverImageLocalpath) {
    throw new ApiError(400, "Cover image is required");
  }
  const coverImageUploadResponse =
    await uploadonCloudinary(coverImageLocalpath);
  if (!coverImageUploadResponse?.secure_url) {
    throw new ApiError(400, "Cover image upload failed");
  }
  let updatedUser = await USER.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImageUploadResponse.secure_url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");
  if (!updatedUser) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Cover image updated successfully")
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }
  /// user mongo Db aggregation pipelines
  const channel = await USER.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    // Pipelines to get subscriber count
    {
      $lookup: {
        from: "subs", //Everything in lowecase and plural
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },

    {
      $lookup: {
        from: "subs",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },

    {
      $addFields: {
        subscribersCount: { $size: "$subscribers" },
        channelSubscribedToCount: { $size: "$subscribedTo" },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        password: 0,
        refreshToken: 0,
        fullname: 1,
        username: 1,
        email: 1,
        avatar: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User channel profile fetched"));
});

const getWatchedHistory = asyncHandler(async (req, res) => {
  const user = await USER.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "videos", // smallcase and plural
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchedHistory",

        // Nested Pipelines to get owner details

        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
              pipeline: [
                {
                  $project: {
                    password: 0,
                    refreshToken: 0,
                    fullname: 1,
                    username: 1,
                    email: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              ownerDetails: { $first: "$ownerDetails" },
            },
          },
        ],
      },
    },
  ]);
  res.status
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0]?.watchedHistory || [],
        "Watch history fetched"
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  currentUser,
  updateAccountDetails,
  updateAvatar,
  generateAccessAndrefreshToken,
  updateCoverImage,
  getUserChannelProfile,
  getWatchedHistory,
};

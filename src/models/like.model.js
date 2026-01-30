import mongoose from "mongoose";
const { Schema } = mongoose;

const likeSchema = new mongoose.Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "VIDEO",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "COMMENT",
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "TWEET",
      required: true,
    },
    likedby: {
      type: Schema.Types.ObjectId,
      ref: "USER",
      required: true,
    },
  },
  { timestamps: true }
);

export const LIKE = mongoose.model("LIKE", likeSchema);

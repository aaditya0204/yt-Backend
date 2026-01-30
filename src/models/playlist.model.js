import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const { Schema } = mongoose;

const playlistSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: "VIDEO",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: "USER",
      required: true,
    },
  },
  { timestamps: true }
);
playlistSchema.plugin(mongooseAggregatePaginate);
export const PLAYLIST = mongoose.model("PLAYLIST", playlistSchema);
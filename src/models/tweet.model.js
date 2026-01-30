import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "USER",
      required: true,
    },
  },    
  { timestamps: true }
);

tweetSchema.plugin(mongooseAggregatePaginate);

export const TWEET = mongoose.model("TWEET", tweetSchema);

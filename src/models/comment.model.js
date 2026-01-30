import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "VIDEO",
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

commentSchema.plugin(mongooseAggregatePaginate);

const COMMENT = mongoose.model("COMMENT", commentSchema);
export default COMMENT;

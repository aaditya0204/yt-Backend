import express from "express";
import { Router } from "express";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router({ mergeParams: true });

router.route("/").get(verifyJWT, getVideoComments);
router.route("/").post(verifyJWT, addComment);
router
  .route("/:commentId")
  .put(verifyJWT, updateComment)
  .delete(verifyJWT, deleteComment);
export default router;

import express from "express";
import { protectedRoute } from "../middlewares/ProtectRoutes.js";
import { CreatePost ,deletePost , commentOnPost , likeUnlikePost, getAllPosts, getLikedPosts, getFollowingPosts, getUsersPosts} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", protectedRoute, getAllPosts);
router.get("/likes/:id", protectedRoute, getLikedPosts);
router.get("/following", protectedRoute, getFollowingPosts);
router.get("/user/:username", protectedRoute, getUsersPosts);
router.post("/create", protectedRoute, CreatePost);
router.post("/like/:id", protectedRoute, likeUnlikePost);
router.post("/comment/:id", protectedRoute, commentOnPost);
router.delete("/:id", protectedRoute, deletePost);

export default router;
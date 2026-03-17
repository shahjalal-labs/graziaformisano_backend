import express from "express";
import { followerController } from "./follower.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post("/toggle-follow-unfollow/:id", auth(), followerController.followUnfollow);
router.patch("/accept-follow-request/:id", auth(), followerController.acceptFollowRequest);
router.patch("/reject-follow-request/:id", auth(), followerController.rejectFollowRequest);
router.get("/request-list", auth(), followerController.followerRequestList);
router.get("/accepted-list", auth(), followerController.followersList);
router.get("/following-list", auth(), followerController.getFollowingList);
router.get("/friends-list", auth(), followerController.getFriendsList);

export const followerRoutes = router;

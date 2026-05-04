import express from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoute } from "../modules/auth/auth.routes";
import { postRoutes } from "../modules/post/post.route";
import { followerRoutes } from "../modules/follower/follower.route";
import { notificationsRoute } from "../modules/notifications/notification.route";
import { eventRoutes } from "../modules/event/event.route";
import { storyRoutes } from "../modules/story/story.route";
import { adminRoute } from "../modules/admin/admin.route";
import { professionRoutes } from "../modules/profession/profession.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/admin",
    route: adminRoute,
  },
  {
    path: "/event",
    route: eventRoutes,
  },
  {
    path: "/post",
    route: postRoutes,
  },
  {
    path: "/table",
    route: professionRoutes,
  },  
  {
    path: "/story",
    route: storyRoutes,
  },
  {
    path: "/follower",
    route: followerRoutes,
  },
  {
    path: "/notification",
    route: notificationsRoute,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

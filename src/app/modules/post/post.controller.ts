import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { postService } from "./post.service";

const createPost = catchAsync(async (req: Request, res: Response) => {
  await postService.createPostInDB(req);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "post created successfully",
  });
});

const myPosts = catchAsync(async (req: Request, res: Response) => {
  const posts = await postService.getMyPostsFromDB(req.user.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "posts retrieved successfully",
    data: posts,
  });
});
const allPosts = catchAsync(async (req: Request, res: Response) => {
  const posts = await postService.getAllPostsFromDB(req.user.id, req.query.type, req.query.search as string);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "posts retrieved successfully",
    data: posts,
  });
});
const likeUnlikePost = catchAsync(async (req: Request, res: Response) => {
  const result = await postService.likeUnlikePostInDB(
    req.params.id,
    req.user.id,
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: result.message,
  });
});
const likedUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await postService.getLikedUsersForPost(
    req.params.id
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "liked users retrieved successfully",
    data: users,
  });
});

const createComment = catchAsync(async (req: Request, res: Response) => {
  await postService.createCommentInDB(req.user.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "comment created successfully",
  });
});
const getPostComments = catchAsync(async (req: Request, res: Response) => {
  const comments = await postService.getPostCommentsFromDB(
    req.user.id,
    req.params.id,
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "comments retrieved successfully",
    data: comments,
  });
});

const likeUnlikeComment = catchAsync(async (req: Request, res: Response) => {
  const result = await postService.likeUnlikeCommentInDB(
    req.params.id,
    req.user.id,
  );
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: result.message,
  });
});


const createReply = catchAsync(async (req: Request, res: Response) => {
  await postService.createReplyInDB(req.user.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "reply created successfully",
  });
});

export const postControllers = {
  createPost,
  allPosts,
  likeUnlikePost,
  createComment,
  getPostComments,
  likeUnlikeComment,
  createReply,
  likedUsers,
  myPosts
};

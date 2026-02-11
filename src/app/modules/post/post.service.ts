import { Request } from "express";
import { uploadInSpace } from "../../../shared/UploadHelper";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

const createPostInDB = async (req: Request) => {
  const userId = req.user.id;
  const payload = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const processImages = async (
    files: Express.Multer.File[],
    folder: string,
  ) => {
    if (!files || files.length === 0) return null;
    return Promise.all(
      files.map((file) => uploadInSpace(file, `posts/${folder}`)),
    );
  };

  const [mediaUrls] = await Promise.all([
    processImages(files?.mediaUrls, "mediaUrls"),
  ]);

  const hasMedia = Array.isArray(mediaUrls) && mediaUrls.length > 0;
  const hasContent = Boolean(payload.content);

  if (!hasMedia && !hasContent) {
    throw new ApiError(400, "Post content or media is required");
  }

  await prisma.post.create({
    data: {
      userId,
      content: payload.content,
      mediaUrls: mediaUrls || [],
    },
  });

  return;
};

const getAllPostsFromDB = async (userId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      mediaUrls: true,
      createdAt: true,
      totalComment: true,
      likes: true,
      user: {
        select: {
          id: true,
          userName: true,
          profileImage: true,
          userProfile: {
            select: {
              profession: true,
            },
          },
          follower: {
            where: { followerId: userId },
            select: {
              id: true,
              isAccepted: true,
            }
          }
        },
      },
    },
  });
  return posts.map((post) => ({
    ...post,
    isLiked: Array.isArray(post.likes) && post.likes.includes(userId),
  }));
};

const likeUnlikePostInDB = async (postId: string, userId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
  });

  const isLiked = post.likes.includes(userId);
  await prisma.post.update({
    where: { id: postId },
    data: {
      likes: isLiked
        ? post.likes.filter((id) => id !== userId)
        : [...post.likes, userId],
    },
  });

  return {
    message: isLiked ? "post unliked successfully" : "post liked successfully",
    isLiked: !isLiked,
  };
};

const createCommentInDB = async (userId: string, payload: any) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  await prisma.post.findUniqueOrThrow({
    where: { id: payload.postId },
  });

  await prisma.comment.create({
    data: {
      userId,
      postId: payload.postId,
      content: payload.content,
    },
  });

  await prisma.post.update({
    where: { id: payload.postId },
    data: {
      totalComment: {
        increment: 1,
      },
    },
  });
};

const getPostCommentsFromDB = async (userId: string, postId: string) => {
  await prisma.post.findUniqueOrThrow({
    where: { id: postId },
  });

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      likes: true,
      user: {
        select: {
          id: true,
          userName: true,
          profileImage: true,
        },
      },
      replies: {
        orderBy: { createdAt: "asc" },
        select: {
          createdAt: true,
          content: true,
          user: {
            select: {
              id: true,
              userName: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });

  return comments.map((comment) => ({
    ...comment,
    isLiked: Array.isArray(comment.likes) && comment.likes.includes(userId),
  }));
};

const likeUnlikeCommentInDB = async (commentId: string, userId: string) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  const comment = await prisma.comment.findUniqueOrThrow({
    where: { id: commentId },
  });

  const isLiked = comment.likes.includes(userId);
  await prisma.comment.update({
    where: { id: commentId },
    data: {
      likes: isLiked
        ? comment.likes.filter((id) => id !== userId)
        : [...comment.likes, userId],
    },
  });

  return {
    message: isLiked
      ? "comment unliked successfully"
      : "comment liked successfully",
    isLiked: !isLiked,
  };
};

const createReplyInDB = async (userId: string, payload: any) => {
  await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });
  await prisma.comment.findUniqueOrThrow({
    where: { id: payload.commentId },
  });

  await prisma.reply.create({
    data: {
      userId,
      commentId: payload.commentId,
      content: payload.content,
    },
  });

  return;
};

export const postService = {
  createPostInDB,
  getAllPostsFromDB,
  likeUnlikePostInDB,
  createCommentInDB,
  getPostCommentsFromDB,
  likeUnlikeCommentInDB,
  createReplyInDB,
};

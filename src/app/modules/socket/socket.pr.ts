// import { WebSocket, WebSocketServer } from "ws";
// import { Request } from "express";
// import prisma from "../../../shared/prisma";
// import { verifyWebSocketToken } from "./socket.service";
// import { parse } from "url";
// import redisClient from "../../../helpers/redis";

// interface CustomWebSocket extends WebSocket {
//   userId?: string;
//   role?: "member" | "admin";
// }

// const roomUsers = new Map<string, Set<WebSocket>>();
// const groupUsers = new Map<string, Set<WebSocket>>();
// const connectedUsers = new Set<CustomWebSocket>();
// const adminRoomWatchers = new Map<string, Set<WebSocket>>();
// let wss;

// export function setupWebSocketServer(server: any) {
//   wss = new WebSocketServer({ server });

//   wss.on("connection", async (ws: CustomWebSocket, req: Request) => {
//     const { query } = parse(req.url!, true);
//     let authToken = req.headers["x-token"] as string;
//     if (!authToken && query["x-token"]) {
//       authToken = Array.isArray(query["x-token"])
//         ? query["x-token"][0]
//         : query["x-token"];
//     }
//     if (!authToken) {
//       console.log("No token provided — closing connection");
//       ws.close();
//       return;
//     }
//     const decoded = verifyWebSocketToken(ws, authToken);
//     if (!decoded) {
//       return;
//     }
//     const userId = decoded.id;
//     ws.userId = userId;
//     ws.role = decoded.role === "admin" ? "admin" : "member";
//     connectedUsers.add(ws);

//     if (!roomUsers.has(userId)) roomUsers.set(userId, new Set());
//     roomUsers.get(userId)?.add(ws);
//     if (!groupUsers.has(userId)) groupUsers.set(userId, new Set());
//     groupUsers.get(userId)?.add(ws);

//     let roomId: string | null = null;

//     const interval = setInterval(() => {
//       if (ws.readyState === WebSocket.OPEN) ws.ping();
//     }, 30000);

//     const conversations = await prisma.room.findMany({
//       where: {
//         OR: [{ senderId: userId }, { receiverId: userId }],
//       },
//       orderBy: { updatedAt: "desc" },
//       include: {
//         user1: { select: { id: true, userName: true, profileImage: true } },
//         user2: { select: { id: true, userName: true, profileImage: true } },
//       },
//     });

//     const connectedUserIds = Array.from(connectedUsers)
//       .map((ws) => ws.userId)
//       .filter((id) => id !== undefined);

//     const formattedConversations = await Promise.all(
//       conversations.map(async (room) => {
//         const partner = room.senderId === userId ? room.user2 : room.user1;
//         const isActive = connectedUserIds.includes(partner?.id as string);

//         const redisKey = `room:${room.id}:messages`;
//         const unreadKey = `room:${room.id}:unread:${userId}`;

//         const [redisRaw, unreadCountStr] = await Promise.all([
//           redisClient.lRange(redisKey, 0, -1),
//           redisClient.get(unreadKey),
//         ]);

//         const unreadCount = parseInt(unreadCountStr || "0", 30);
//         let latestMessage = null;

//         if (redisRaw.length > 0) {
//           const redisMessages = redisRaw.map((msg: any) => JSON.parse(msg));

//           redisMessages.sort(
//             (a: any, b: any) =>
//               new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
//           );

//           const latestRedisMsg = redisMessages[0];

//           latestMessage = {
//             content:
//               latestRedisMsg.content ??
//               (latestRedisMsg.fileUrl ? "sent file" : null),
//             createdAt: latestRedisMsg.createdAt,
//           };
//         }

//         return {
//           roomId: room.id,
//           partner: {
//             id: partner?.id,
//             userName: partner?.userName,
//             profileImage: partner?.profileImage,
//             isActive,
//           },
//           lastMessage: latestMessage,
//           unreadCount,
//         };
//       }),
//     );

//     ws.send(
//       JSON.stringify({
//         type: "member-conversation",
//         conversations: formattedConversations,
//       }),
//     );

//     ws.on("message", async (message: any) => {
//       try {
//         const { type, receiverId, content, fileUrl } = JSON.parse(
//           message.toString(),
//         );

//         const getConversationsForUser = async (targetUserId: string) => {
//           const rooms = await prisma.room.findMany({
//             where: {
//               OR: [{ senderId: targetUserId }, { receiverId: targetUserId }],
//             },
//             orderBy: { updatedAt: "desc" },
//             include: {
//               user1: {
//                 select: { id: true, userName: true, profileImage: true },
//               },
//               user2: {
//                 select: { id: true, userName: true, profileImage: true },
//               },
//             },
//           });

//           return Promise.all(
//             rooms.map(async (room) => {
//               const partner =
//                 room.senderId === targetUserId ? room.user2 : room.user1;
//               const isActive = connectedUserIds.includes(partner?.id as string);

//               const redisKey = `room:${room.id}:messages`;
//               const unreadKey = `room:${room.id}:unread:${targetUserId}`;

//               const buffered = await redisClient.lRange(redisKey, -1, -1);
//               const lastMessage =
//                 buffered.length > 0 ? JSON.parse(buffered[0]) : null;

//               const unreadCountStr = await redisClient.get(unreadKey);
//               const unreadCount = parseInt(unreadCountStr || "0", 30);

//               const lastMessageContent =
//                 lastMessage?.content ||
//                 (lastMessage?.fileUrl?.length > 0 ? "sent file" : null);

//               return {
//                 roomId: room.id,
//                 partner: {
//                   id: partner?.id,
//                   userName: partner?.userName,
//                   profileImage: partner?.profileImage,
//                   isActive,
//                 },
//                 lastMessage: lastMessage
//                   ? {
//                       content: lastMessageContent,
//                       createdAt: lastMessage?.createdAt || null,
//                     }
//                   : null,
//                 unreadCount,
//               };
//             }),
//           );
//         };

//         switch (type) {
//           // --- MEMBER LOGIC START ---
//           case "member-subscribe": {
//             if (!receiverId) {
//               return ws.send(
//                 JSON.stringify({
//                   type: "error",
//                   message: "receiverId is required",
//                 }),
//               );
//             }

//             let room =
//               (await prisma.room.findFirst({
//                 where: {
//                   OR: [
//                     { senderId: userId, receiverId },
//                     { senderId: receiverId, receiverId: userId },
//                   ],
//                 },
//               })) ||
//               (await prisma.room.create({
//                 data: { senderId: userId, receiverId },
//               }));

//             roomId = room.id;

//             const unreadKey = `room:${roomId}:unread:${userId}`;
//             await redisClient.set(unreadKey, "0");

//             roomUsers.forEach((clients, key) => {
//               if (clients.has(ws)) {
//                 clients.delete(ws);
//                 if (clients.size === 0) roomUsers.delete(key);
//               }
//             });

//             if (!roomUsers.has(roomId)) {
//               roomUsers.set(roomId, new Set());
//             }
//             roomUsers.get(roomId)?.add(ws);

//             const redisKey = `room:${roomId}:messages`;
//             const redisRaw = await redisClient.lRange(redisKey, -30, -1);
//             const messages = redisRaw
//               .reverse()
//               .map((msg: any) => JSON.parse(msg));

//             ws.send(
//               JSON.stringify({ type: "past-messages", roomId, messages }),
//             );

//             const senderConversations = await getConversationsForUser(userId);
//             ws.send(
//               JSON.stringify({
//                 type: "member-conversation",
//                 conversations: senderConversations,
//               }),
//             );

//             break;
//           }

//           case "member-send-message": {
//             if (!roomId) {
//               return ws.send(
//                 JSON.stringify({
//                   type: "error",
//                   message: "You are not subscribed to any room",
//                 }),
//               );
//             }

//             const roomInfo = await prisma.room.findUnique({
//               where: { id: roomId },
//               select: { senderId: true, receiverId: true },
//             });

//             if (!roomInfo) {
//               return ws.send(
//                 JSON.stringify({ type: "error", message: "Room not found" }),
//               );
//             }

//             const messagePayload = {
//               content,
//               senderId: userId,
//               receiverId,
//               roomId,
//               fileUrl: fileUrl ?? [""],
//               createdAt: new Date().toISOString(),
//             };

//             const redisKey = `room:${roomId}:messages`;
//             await redisClient.rPush(redisKey, JSON.stringify(messagePayload));

//             const unreadKey = `room:${roomId}:unread:${receiverId}`;
//             await redisClient.incr(unreadKey);
//             const count = await redisClient.lLen(redisKey);

//             if (count >= 30) {
//               const messagesToSaveRaw = await redisClient.lRange(
//                 redisKey,
//                 0,
//                 14,
//               );
//               const messagesToSave = messagesToSaveRaw.map((msg: any) =>
//                 JSON.parse(msg),
//               );
//               await prisma.message.createMany({ data: messagesToSave });
//               await redisClient.lTrim(redisKey, 15, -1);
//             }

//             await prisma.room.update({
//               where: { id: roomId },
//               data: { updatedAt: new Date() },
//             });

//             roomUsers.get(roomId)?.forEach((client) => {
//               if (client.readyState === WebSocket.OPEN) {
//                 client.send(
//                   JSON.stringify({
//                     type: "member-new-message",
//                     message: messagePayload,
//                     roomId,
//                   }),
//                 );
//               }
//             });

//             const target = Array.from(connectedUsers).find(
//               (client) => client.userId === receiverId,
//             );

//             if (target) {
//               const receiverConversations =
//                 await getConversationsForUser(receiverId);
//               target.send(
//                 JSON.stringify({
//                   type: "member-conversation",
//                   conversations: receiverConversations,
//                 }),
//               );
//             }

//             const senderConversations = await getConversationsForUser(userId);
//             ws.send(
//               JSON.stringify({
//                 type: "member-conversation",
//                 conversations: senderConversations,
//               }),
//             );

//             break;
//           }

//           case "member-conversation": {
//             const conversations = await prisma.room.findMany({
//               where: { OR: [{ senderId: userId }, { receiverId: userId }] },
//               orderBy: { updatedAt: "desc" },
//               include: {
//                 user1: {
//                   select: { id: true, userName: true, profileImage: true },
//                 },
//                 user2: {
//                   select: { id: true, userName: true, profileImage: true },
//                 },
//               },
//             });

//             const connectedUserIds = Array.from(connectedUsers)
//               .map((ws) => ws.userId)
//               .filter((id) => id !== undefined);

//             const formattedConversations = await Promise.all(
//               conversations.map(async (room) => {
//                 const partner =
//                   room.senderId === userId ? room.user2 : room.user1;
//                 const isActive = connectedUserIds.includes(
//                   partner?.id as string,
//                 );

//                 const redisKey = `room:${room.id}:messages`;
//                 const unreadKey = `room:${room.id}:unread:${userId}`;

//                 const latestRaw = await redisClient.lRange(redisKey, -1, -1);
//                 const latestMsg =
//                   latestRaw.length > 0 ? JSON.parse(latestRaw[0]) : null;

//                 const unreadCountStr = await redisClient.get(unreadKey);
//                 const unreadCount = parseInt(unreadCountStr || "0", 30);

//                 const latestMessage = latestMsg
//                   ? {
//                       content:
//                         latestMsg.content ??
//                         (latestMsg.fileUrl ? "sent file" : null),
//                       createdAt: latestMsg.createdAt,
//                     }
//                   : null;

//                 return {
//                   roomId: room.id,
//                   partner: {
//                     id: partner?.id,
//                     userName: partner?.userName,
//                     profileImage: partner?.profileImage,
//                     isActive,
//                   },
//                   lastMessage: latestMessage,
//                   unreadCount,
//                 };
//               }),
//             );

//             ws.send(
//               JSON.stringify({
//                 type: "member-conversation",
//                 conversations: formattedConversations,
//               }),
//             );

//             break;
//           }

//           case "event-subscribe": {
//             const { eventId } = JSON.parse(message.toString());

//             // 1. verify user belongs to event
//             // const attendee = await prisma.eventAttendee.findFirst({
//             //   where: { eventId, userId },
//             // });

//             // if (!attendee) {
//             //   return ws.send(
//             //     JSON.stringify({ type: "error", message: "Not an attendee" }),
//             //   );
//             // }

//             // 2. find or create event room
//             let eventRoom = await prisma.eventRoom.findFirst({
//               where: { eventId },
//             });

//             if (!eventRoom) {
//               eventRoom = await prisma.eventRoom.create({ data: { eventId } });
//             }

//             const eventRoomId = eventRoom.id;

//             // 3. add socket to event group
//             if (!groupUsers.has(eventRoomId))
//               groupUsers.set(eventRoomId, new Set());
//             groupUsers.get(eventRoomId)?.add(ws);

//             // 4. load history (redis/db same pattern as rooms)
//             const redisKey = `event:${eventRoomId}:messages`;
//             const redisRaw = await redisClient.lRange(redisKey, -50, -1);
//             const messages = redisRaw.map((m) => JSON.parse(m));

//             ws.send(
//               JSON.stringify({
//                 type: "event-history",
//                 eventRoomId,
//                 messages,
//               }),
//             );

//             break;
//           }

//           case "event-send-message": {
//             const { eventRoomId, content } = JSON.parse(message.toString());

//             const payload = {
//               senderId: userId,
//               eventRoomId,
//               content,
//               createdAt: new Date().toISOString(),
//             };

//             const redisKey = `event:${eventRoomId}:messages`;
//             await redisClient.rPush(redisKey, JSON.stringify(payload));

//             groupUsers.get(eventRoomId)?.forEach((client) => {
//               if (client.readyState === WebSocket.OPEN) {
//                 client.send(
//                   JSON.stringify({
//                     type: "event-new-message",
//                     message: payload,
//                   }),
//                 );
//               }
//             });

//             break;
//           }
//           // --- MEMBER LOGIC END ---

//           // --- ADMIN LOGIC START ---
//           case "admin-subscribe-room": {
//             const { roomId } = JSON.parse(message.toString());
//             if (!roomId) return;

//             if (!adminRoomWatchers.has(roomId))
//               adminRoomWatchers.set(roomId, new Set());
//             adminRoomWatchers.get(roomId)?.add(ws);

//             const dbMessages = await prisma.message.findMany({
//               where: { roomId },
//               orderBy: { createdAt: "asc" },
//             });

//             const redisKey = `room:${roomId}:messages`;
//             const redisRaw = await redisClient.lRange(redisKey, 0, -1);
//             const redisMessages = redisRaw.map((m) => JSON.parse(m));

//             const messages = [...dbMessages, ...redisMessages].sort(
//               (a, b) =>
//                 new Date(a.createdAt).getTime() -
//                 new Date(b.createdAt).getTime(),
//             );

//             ws.send(
//               JSON.stringify({ type: "admin-room-messages", roomId, messages }),
//             );

//             break;
//           }
//           // --- ADMIN LOGIC END ---

//           default:
//             ws.send(
//               JSON.stringify({
//                 type: "error",
//                 message: "Invalid message type",
//               }),
//             );
//         }
//       } catch (err: unknown) {
//         if (err instanceof SyntaxError) {
//           ws.send(JSON.stringify({ type: "error", message: "Bad JSON" }));
//         } else if (err instanceof Error) {
//           ws.send(JSON.stringify({ type: "error", message: err }));
//         } else {
//           ws.send(
//             JSON.stringify({ type: "error", message: "Unexpected error" }),
//           );
//         }
//       }
//     });

//     ws.on("close", async () => {
//       connectedUsers.delete(ws);

//       if (roomId) {
//         const clients = roomUsers.get(roomId);
//         clients?.delete(ws);
//         if (clients?.size === 0) roomUsers.delete(roomId);
//       }

//       console.log("WebSocket client disconnected!");
//       clearInterval(interval);
//     });
//   });
// }

// export const socket = { wss, roomUsers, adminRoomWatchers };

// shahjalal changed this
import { WebSocket, WebSocketServer } from "ws";
import { Request } from "express";
import prisma from "../../../shared/prisma";
import { verifyWebSocketToken } from "./socket.service";
import { parse } from "url";
import redisClient from "../../../helpers/redis";
import { sendSingleNotification } from "../notifications/notification.services";

interface CustomWebSocket extends WebSocket {
  userId?: string;
  role?: "member" | "admin";
}

const roomUsers = new Map<string, Set<WebSocket>>();
const groupUsers = new Map<string, Set<WebSocket>>();
const connectedUsers = new Set<CustomWebSocket>();
const adminRoomWatchers = new Map<string, Set<WebSocket>>();
let wss;

export function setupWebSocketServer(server: any) {
  wss = new WebSocketServer({ server });

  wss.on("connection", async (ws: CustomWebSocket, req: Request) => {
    const { query } = parse(req.url!, true);
    let authToken = req.headers["x-token"] as string;
    if (!authToken && query["x-token"]) {
      authToken = Array.isArray(query["x-token"])
        ? query["x-token"][0]
        : query["x-token"];
    }
    if (!authToken) {
      console.log("No token provided — closing connection");
      ws.close();
      return;
    }
    const decoded = verifyWebSocketToken(ws, authToken);
    if (!decoded) {
      return;
    }
    const userId = decoded.id;
    ws.userId = userId;
    ws.role = decoded.role === "admin" ? "admin" : "member";
    connectedUsers.add(ws);

    if (!roomUsers.has(userId)) roomUsers.set(userId, new Set());
    roomUsers.get(userId)?.add(ws);
    if (!groupUsers.has(userId)) groupUsers.set(userId, new Set());
    groupUsers.get(userId)?.add(ws);

    let roomId: string | null = null;

    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) ws.ping();
    }, 30000);

    const conversations = await prisma.room.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        user1: { select: { id: true, userName: true, profileImage: true } },
        user2: { select: { id: true, userName: true, profileImage: true } },
      },
    });

    const connectedUserIds = Array.from(connectedUsers)
      .map((ws) => ws.userId)
      .filter((id) => id !== undefined);

    const formattedConversations = await Promise.all(
      conversations.map(async (room) => {
        const partner = room.senderId === userId ? room.user2 : room.user1;
        const isActive = connectedUserIds.includes(partner?.id as string);

        const redisKey = `room:${room.id}:messages`;
        const unreadKey = `room:${room.id}:unread:${userId}`;

        const [redisRaw, unreadCountStr] = await Promise.all([
          redisClient.lRange(redisKey, 0, -1),
          redisClient.get(unreadKey),
        ]);

        const unreadCount = parseInt(unreadCountStr || "0", 10);
        let latestMessage = null;

        if (redisRaw.length > 0) {
          const redisMessages = redisRaw.map((msg: any) => JSON.parse(msg));

          redisMessages.sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

          const latestRedisMsg = redisMessages[0];

          latestMessage = {
            content:
              latestRedisMsg.content ??
              (latestRedisMsg.fileUrl ? "sent file" : null),
            createdAt: latestRedisMsg.createdAt,
          };
        }

        return {
          roomId: room.id,
          partner: {
            id: partner?.id,
            userName: partner?.userName,
            profileImage: partner?.profileImage,
            isActive,
          },
          lastMessage: latestMessage,
          unreadCount,
        };
      }),
    );

    ws.send(
      JSON.stringify({
        type: "member-conversation",
        conversations: formattedConversations,
      }),
    );

    const eventConversations = await getEventConversationsForUser(userId);
    ws.send(
      JSON.stringify({
        type: "event-conversation",
        conversations: eventConversations,
      }),
    );

    ws.on("message", async (message: any) => {
      try {
        const { type, receiverId, content, fileUrl } = JSON.parse(
          message.toString(),
        );

        const getConversationsForUser = async (targetUserId: string) => {
          const rooms = await prisma.room.findMany({
            where: {
              OR: [{ senderId: targetUserId }, { receiverId: targetUserId }],
            },
            orderBy: { updatedAt: "desc" },
            include: {
              user1: {
                select: { id: true, userName: true, profileImage: true },
              },
              user2: {
                select: { id: true, userName: true, profileImage: true },
              },
            },
          });

          return Promise.all(
            rooms.map(async (room) => {
              const partner =
                room.senderId === targetUserId ? room.user2 : room.user1;
              const isActive = connectedUserIds.includes(partner?.id as string);

              const redisKey = `room:${room.id}:messages`;
              const unreadKey = `room:${room.id}:unread:${targetUserId}`;

              const buffered = await redisClient.lRange(redisKey, -1, -1);
              const lastMessage =
                buffered.length > 0 ? JSON.parse(buffered[0]) : null;

              const unreadCountStr = await redisClient.get(unreadKey);
              const unreadCount = parseInt(unreadCountStr || "0", 10);

              const lastMessageContent =
                lastMessage?.content ||
                (lastMessage?.fileUrl?.length > 0 ? "sent file" : null);

              return {
                roomId: room.id,
                partner: {
                  id: partner?.id,
                  userName: partner?.userName,
                  profileImage: partner?.profileImage,
                  isActive,
                },
                lastMessage: lastMessage
                  ? {
                      content: lastMessageContent,
                      createdAt: lastMessage?.createdAt || null,
                    }
                  : null,
                unreadCount,
              };
            }),
          );
        };

        switch (type) {
          // --- MEMBER LOGIC START ---
          case "member-subscribe": {
            if (!receiverId) {
              return ws.send(
                JSON.stringify({
                  type: "error",
                  message: "receiverId is required",
                }),
              );
            }

            let room =
              (await prisma.room.findFirst({
                where: {
                  OR: [
                    { senderId: userId, receiverId },
                    { senderId: receiverId, receiverId: userId },
                  ],
                },
              })) ||
              (await prisma.room.create({
                data: { senderId: userId, receiverId },
              }));

            roomId = room.id;

            const unreadKey = `room:${roomId}:unread:${userId}`;
            await redisClient.set(unreadKey, "0");

            roomUsers.forEach((clients, key) => {
              if (clients.has(ws)) {
                clients.delete(ws);
                if (clients.size === 0) roomUsers.delete(key);
              }
            });

            if (!roomUsers.has(roomId)) {
              roomUsers.set(roomId, new Set());
            }
            roomUsers.get(roomId)?.add(ws);

            const redisKey = `room:${roomId}:messages`;
            const redisRaw = await redisClient.lRange(redisKey, -30, -1);
            const messages = redisRaw
              .reverse()
              .map((msg: any) => JSON.parse(msg));

            ws.send(
              JSON.stringify({ type: "past-messages", roomId, messages }),
            );

            const senderConversations = await getConversationsForUser(userId);
            ws.send(
              JSON.stringify({
                type: "member-conversation",
                conversations: senderConversations,
              }),
            );

            break;
          }

          case "member-send-message": {
            if (!roomId) {
              return ws.send(
                JSON.stringify({
                  type: "error",
                  message: "You are not subscribed to any room",
                }),
              );
            }

            const roomInfo = await prisma.room.findUnique({
              where: { id: roomId },
              select: { senderId: true, receiverId: true },
            });

            if (!roomInfo) {
              return ws.send(
                JSON.stringify({ type: "error", message: "Room not found" }),
              );
            }

            const targetReceiverId =
              roomInfo.senderId === userId
                ? roomInfo.receiverId
                : roomInfo.senderId;

            if (!targetReceiverId) {
              return ws.send(
                JSON.stringify({
                  type: "error",
                  message: "Receiver not found",
                }),
              );
            }

            const messagePayload = {
              content,
              senderId: userId,
              receiverId: targetReceiverId,
              roomId,
              fileUrl: fileUrl ?? [""],
              createdAt: new Date().toISOString(),
            };

            const redisKey = `room:${roomId}:messages`;
            await redisClient.rPush(redisKey, JSON.stringify(messagePayload));

            const unreadKey = `room:${roomId}:unread:${targetReceiverId}`;
            await redisClient.incr(unreadKey);
            const count = await redisClient.lLen(redisKey);

            if (count >= 30) {
              const messagesToSaveRaw = await redisClient.lRange(
                redisKey,
                0,
                14,
              );
              const messagesToSave = messagesToSaveRaw.map((msg: any) =>
                JSON.parse(msg),
              );
              await prisma.message.createMany({ data: messagesToSave });
              await redisClient.lTrim(redisKey, 15, -1);
            }

            await prisma.room.update({
              where: { id: roomId },
              data: { updatedAt: new Date() },
            });

            roomUsers.get(roomId)?.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    type: "member-new-message",
                    message: messagePayload,
                    roomId,
                  }),
                );
              }
            });

            const target = Array.from(connectedUsers).find(
              (client) => client.userId === targetReceiverId,
            );

            if (target) {
              const receiverConversations =
                await getConversationsForUser(targetReceiverId);
              target.send(
                JSON.stringify({
                  type: "member-conversation",
                  conversations: receiverConversations,
                }),
              );
            }

            try {
              await sendSingleNotification(
                targetReceiverId,
                content || "You received a new message",
                userId,
                "Nuovo messaggio",
              );
            } catch {}

            const senderConversations = await getConversationsForUser(userId);
            ws.send(
              JSON.stringify({
                type: "member-conversation",
                conversations: senderConversations,
              }),
            );

            break;
          }

          case "member-conversation": {
            const conversations = await prisma.room.findMany({
              where: { OR: [{ senderId: userId }, { receiverId: userId }] },
              orderBy: { updatedAt: "desc" },
              include: {
                user1: {
                  select: { id: true, userName: true, profileImage: true },
                },
                user2: {
                  select: { id: true, userName: true, profileImage: true },
                },
              },
            });

            const connectedUserIds = Array.from(connectedUsers)
              .map((ws) => ws.userId)
              .filter((id) => id !== undefined);

            const formattedConversations = await Promise.all(
              conversations.map(async (room) => {
                const partner =
                  room.senderId === userId ? room.user2 : room.user1;
                const isActive = connectedUserIds.includes(
                  partner?.id as string,
                );

                const redisKey = `room:${room.id}:messages`;
                const unreadKey = `room:${room.id}:unread:${userId}`;

                const latestRaw = await redisClient.lRange(redisKey, -1, -1);
                const latestMsg =
                  latestRaw.length > 0 ? JSON.parse(latestRaw[0]) : null;

                const unreadCountStr = await redisClient.get(unreadKey);
                const unreadCount = parseInt(unreadCountStr || "0", 10);

                const latestMessage = latestMsg
                  ? {
                      content:
                        latestMsg.content ??
                        (latestMsg.fileUrl ? "sent file" : null),
                      createdAt: latestMsg.createdAt,
                    }
                  : null;

                return {
                  roomId: room.id,
                  partner: {
                    id: partner?.id,
                    userName: partner?.userName,
                    profileImage: partner?.profileImage,
                    isActive,
                  },
                  lastMessage: latestMessage,
                  unreadCount,
                };
              }),
            );

            ws.send(
              JSON.stringify({
                type: "member-conversation",
                conversations: formattedConversations,
              }),
            );

            break;
          }

          case "event-subscribe": {
            const { eventId } = JSON.parse(message.toString());

            // 1. verify user belongs to event
            // const attendee = await prisma.eventAttendee.findFirst({
            //   where: { eventId, userId },
            // });

            // if (!attendee) {
            //   return ws.send(
            //     JSON.stringify({ type: "error", message: "Not an attendee" }),
            //   );
            // }

            // 2. find or create event room
            let eventRoom = await prisma.eventRoom.findFirst({
              where: { eventId },
            });

            if (!eventRoom) {
              eventRoom = await prisma.eventRoom.create({ data: { eventId } });
            }

            const eventRoomId = eventRoom.id;

            // 3. add socket to event group
            if (!groupUsers.has(eventRoomId))
              groupUsers.set(eventRoomId, new Set());
            groupUsers.get(eventRoomId)?.add(ws);

            const unreadKey = `event:${eventRoomId}:unread:${userId}`;
            await redisClient.set(unreadKey, "0");

            // 4. load history (redis/db same pattern as rooms)
            const redisKey = `event:${eventRoomId}:messages`;
            const redisRaw = await redisClient.lRange(redisKey, -50, -1);
            const messages = redisRaw.map((m) => JSON.parse(m));

            ws.send(
              JSON.stringify({
                type: "event-history",
                eventRoomId,
                messages,
              }),
            );

            const userEventConversations =
              await getEventConversationsForUser(userId);
            ws.send(
              JSON.stringify({
                type: "event-conversation",
                conversations: userEventConversations,
              }),
            );

            break;
          }

          case "event-send-message": {
            const { eventRoomId, content } = JSON.parse(message.toString());

            const payload = {
              senderId: userId,
              eventRoomId,
              content,
              createdAt: new Date().toISOString(),
            };

            const redisKey = `event:${eventRoomId}:messages`;
            await redisClient.rPush(redisKey, JSON.stringify(payload));

            const count = await redisClient.lLen(redisKey);
            if (count >= 30) {
              const messagesToSaveRaw = await redisClient.lRange(
                redisKey,
                0,
                14,
              );
              const messagesToSave = messagesToSaveRaw.map((msg: any) =>
                JSON.parse(msg),
              );
              // Note: No EventMessage model, so skipping DB save for now
              // await prisma.eventMessage.createMany({ data: messagesToSave });
              await redisClient.lTrim(redisKey, 15, -1);
            }

            await prisma.eventRoom.update({
              where: { id: eventRoomId },
              data: { updatedAt: new Date() },
            });

            groupUsers.get(eventRoomId)?.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(
                  JSON.stringify({
                    type: "event-new-message",
                    message: payload,
                  }),
                );
              }
            });

            // Increment unread for other participants
            const eventRoomInfo = await prisma.eventRoom.findUnique({
              where: { id: eventRoomId },
              select: { eventId: true },
            });
            if (eventRoomInfo) {
              const eventId = eventRoomInfo.eventId;
              const attendees = await prisma.eventAttendee.findMany({
                where: { eventId },
                select: { userId: true },
              });
              const host = await prisma.event.findUnique({
                where: { id: eventId },
                select: { userId: true },
              });
              const participantIds = [
                ...new Set(
                  [...attendees.map((a) => a.userId), host?.userId].filter(
                    Boolean,
                  ),
                ),
              ];
              for (const pid of participantIds) {
                if (pid !== userId) {
                  const ukey = `event:${eventRoomId}:unread:${pid}`;
                  await redisClient.incr(ukey);
                }
              }

              const recipients = participantIds.filter(
                (pid) => pid !== userId,
              ) as string[];
              await Promise.allSettled(
                recipients.map((participantId) =>
                  sendSingleNotification(
                    participantId,
                    content || "New message in your event",
                    userId,
                    "Event Message",
                  ),
                ),
              );

              // Update conversations for sender
              const senderEventConvs =
                await getEventConversationsForUser(userId);
              ws.send(
                JSON.stringify({
                  type: "event-conversation",
                  conversations: senderEventConvs,
                }),
              );

              // Update conversations for other connected participants
              const connectedParticipants = Array.from(connectedUsers).filter(
                (client) =>
                  participantIds.includes(client.userId) &&
                  client.userId !== userId,
              );
              for (const client of connectedParticipants) {
                const convs = await getEventConversationsForUser(
                  client.userId!,
                );
                client.send(
                  JSON.stringify({
                    type: "event-conversation",
                    conversations: convs,
                  }),
                );
              }
            }

            break;
          }

          case "event-conversation": {
            const eventConversations =
              await getEventConversationsForUser(userId);
            ws.send(
              JSON.stringify({
                type: "event-conversation",
                conversations: eventConversations,
              }),
            );
            break;
          }
          // --- MEMBER LOGIC END ---

          // --- ADMIN LOGIC START ---
          case "admin-subscribe-room": {
            const { roomId } = JSON.parse(message.toString());
            if (!roomId) return;

            if (!adminRoomWatchers.has(roomId))
              adminRoomWatchers.set(roomId, new Set());
            adminRoomWatchers.get(roomId)?.add(ws);

            const dbMessages = await prisma.message.findMany({
              where: { roomId },
              orderBy: { createdAt: "asc" },
            });

            const redisKey = `room:${roomId}:messages`;
            const redisRaw = await redisClient.lRange(redisKey, 0, -1);
            const redisMessages = redisRaw.map((m) => JSON.parse(m));

            const messages = [...dbMessages, ...redisMessages].sort(
              (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime(),
            );

            ws.send(
              JSON.stringify({ type: "admin-room-messages", roomId, messages }),
            );

            break;
          }
          // --- ADMIN LOGIC END ---

          default:
            ws.send(
              JSON.stringify({
                type: "error",
                message: "Invalid message type",
              }),
            );
        }
      } catch (err: unknown) {
        if (err instanceof SyntaxError) {
          ws.send(JSON.stringify({ type: "error", message: "Bad JSON" }));
        } else if (err instanceof Error) {
          ws.send(JSON.stringify({ type: "error", message: err }));
        } else {
          ws.send(
            JSON.stringify({ type: "error", message: "Unexpected error" }),
          );
        }
      }
    });

    ws.on("close", async () => {
      connectedUsers.delete(ws);

      if (roomId) {
        const clients = roomUsers.get(roomId);
        clients?.delete(ws);
        if (clients?.size === 0) roomUsers.delete(roomId);
      }

      console.log("WebSocket client disconnected!");
      clearInterval(interval);
    });
  });
}

async function getEventConversationsForUser(targetUserId: string) {
  const connectedUserIds = Array.from(connectedUsers)
    .map((ws) => ws.userId)
    .filter((id) => id !== undefined);

  const eventRooms = await prisma.eventRoom.findMany({
    where: {
      event: {
        OR: [
          { userId: targetUserId },
          { eventAttendees: { some: { userId: targetUserId } } },
        ],
      },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      event: {
        select: {
          id: true,
          eventName: true,
          userId: true,

          eventAttendees: { select: { userId: true } },
        },
      },
    },
  });

  return Promise.all(
    eventRooms.map(async (eventRoom) => {
      const event = eventRoom.event;
      const attendeeIds = [
        ...new Set([
          ...event.eventAttendees.map((a) => a.userId),
          event.userId,
        ]),
      ];
      const onlineCount = attendeeIds.filter((id) =>
        connectedUserIds.includes(id),
      ).length;
      const isActive = onlineCount > 1;

      const redisKey = `event:${eventRoom.id}:messages`;
      const unreadKey = `event:${eventRoom.id}:unread:${targetUserId}`;

      const [latestRaw, unreadCountStr] = await Promise.all([
        redisClient.lRange(redisKey, -1, -1),
        redisClient.get(unreadKey),
      ]);

      const latestMsg = latestRaw.length > 0 ? JSON.parse(latestRaw[0]) : null;
      const unreadCount = parseInt(unreadCountStr || "0", 10);

      const latestMessage = latestMsg
        ? {
            content: latestMsg.content,
            createdAt: latestMsg.createdAt,
          }
        : null;

      return {
        eventRoomId: eventRoom.id,
        event: {
          id: event.id,
          eventName: event.eventName,
          isActive,
        },
        lastMessage: latestMessage,
        unreadCount,
      };
    }),
  );
}

export const socket = { wss, roomUsers, adminRoomWatchers };

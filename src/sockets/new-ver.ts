import http from "http";
import jwt from "jsonwebtoken";
import cron from "node-cron";
import socketio, { Socket } from "socket.io";
import JwtPayload from "../@types/jwt-payload";
import {
  firebaseAdmin as admin,
  initializeFirebaseAdmin,
} from "../drivers/firebase/init";
import ConversationModel from "../models/conversation-model";
import DeviceInfoModel from "../models/device-info-model";
import LocationModel from "../models/location";
import MessageModel from "../models/message-model";
import ReactionModel from "../models/reaction-model";
import UserModel from "../models/user-model";
import logger from "../utils/logger";
const _ = require("lodash");

async function requestLocation() {
  const users = await UserModel.find({
    requireLocation: true,
  });

  const tokens = await Promise.all(
    users.map(async (user) => {
      const locate = await LocationModel.findOne({
        userId: user.id,
      })
        .sort({ _id: -1 })
        .limit(1);

      // Check thời gian
      const pivot = new Date(Date.now() - 30 * 60 * 1000);
      if ((locate?.createdAt as Date) < pivot) {
        return await (tokenByUserId as any)[user.id];
      }

      return undefined;
    }) || []
  );

  if (tokens.filter((el) => el).length) {
    await admin?.messaging().sendMulticast({
      notification: {
        title: "Đã lâu rồi bạn không bật định vị",
        body: "Hãy vào ứng dụng và bật định vị trong giờ hành chính nhá!",
      },
      data: {
        requireLocation: "true",
      },
      tokens: tokens.filter((el) => el),
    });
  }
}

// Chạy công việc mỗi 30 phút trong khoảng từ 8h đến 12h vào mỗi ngày
cron.schedule("*/30 1-5 * * *", requestLocation);

// Chạy công việc mỗi 30 phút trong khoảng từ 13h15 đến 17h15 vào mỗi ngày
cron.schedule("15,45 6-9 * * *", requestLocation);

const countUpdates = new Map();

const addFriendUpdates = new Map();

type CustomSocket = Socket & {
  user?: any;
  fcmtkn?: string;
  platform?: string;
};
let webByUserId: object = {};
let mobileByUserId: object = {};
let tokenByUserId: object = {};

function createSocket(app: http.Server): void {
  const io = new socketio.Server(app, {
    cors: { origin: "*" },
  });

  logger.info("Socket đã được khởi tạo");

  io.on("connection", (socket: CustomSocket) => {
    try {
      socket.on("new_connect", async (data) => {
        if (!data) {
          return;
        }
        const { accessToken } = data;
        if (!accessToken) {
        } else {
          try {
            socket.user = jwt.verify(
              accessToken as string,
              process.env.ACCESS_TOKEN_SECRET_KEY as string
            ) as JwtPayload;
          } catch (err) {
            console.log(err);
            socket.emit("require_logout");
          }
        }
      });

      socket.on("device", async (data) => {
        if (!socket.user) {
          return;
        }

        const { token, platform: plat } = data;

        console.log("Nhận sự kiện device:", socket.id, data);

        socket.platform = plat;
        socket.fcmtkn = token;

        await UserModel.findByIdAndUpdate(socket.user.id, {
          $set: {
            online: true,
          },
        });
        io.emit("user_online", socket.user.id);

        if (plat === "Web") {
          const socketId = (webByUserId as any)[socket.user.id];
          if (socketId !== socket.id) {
            const targetWs = io.sockets.sockets.get(socketId);
            if (targetWs) {
              console.log("Yêu cầu logout trên nền tảng web:", targetWs.id);
              targetWs.leave(socket.user.id);
              socket.to(targetWs.id).emit("require_logout");
            }

            (webByUserId as any)[socket.user.id] = socket.id;
          }

          socket.join(socket.user.id);
        } else {
          const device = await DeviceInfoModel.findOne({
            userId: socket.user.id,
          });
          if (token && device?.token === token) {
            const socketId = (mobileByUserId as any)[socket.user.id];
            if (socketId !== socket.id) {
              const targetWs = io.sockets.sockets.get(socketId);
              if (targetWs) {
                console.log(
                  "Yêu cầu logout trên nền tảng mobile:",
                  targetWs.id
                );
                targetWs.leave(socket.user.id);
                socket.to(targetWs.id).emit("require_logout");
              }
            }

            (mobileByUserId as any)[socket.user.id] = socket.id;
            (tokenByUserId as any)[socket.user.id] = token;
            socket.join(socket.user.id);
          } else {
            socket.emit("require_logout");
          }
        }

        console.log("webByUserId:", webByUserId);
        console.log("mobileByUserId:", mobileByUserId);
        console.log("tokenByUserId", tokenByUserId);
      });

      // Location
      socket.on("share_location", (data) => {
        const { longitude, latitude, ip, mac, token } = data;
        console.log("share_location:::", data);

        // Tiến hành lưu tọa độ
        if (socket.user) {
          const newLocate = new LocationModel({
            userId: socket.user.id,
            longitude,
            latitude,
            ip,
            mac,
            token,
          });
          newLocate.save();
        }
      });

      // thu hồi react
      socket.on("unReact", async (data) => {
        const {
          conversationId,
          messageId,
          user: { id: userId },
        } = data;

        const reaction = await ReactionModel.findOneAndUpdate(
          {
            messageId,
            user: userId,
          },
          {
            [`reacts.angry`]: 0,
            [`reacts.cry`]: 0,
            [`reacts.dislike`]: 0,
            [`reacts.haha`]: 0,
            [`reacts.like`]: 0,
            [`reacts.love`]: 0,
            [`reacts.sad`]: 0,
            [`reacts.wow`]: 0,
          },
          { upsert: true, new: true }
        );
        if (!reaction) {
          socket.to(conversationId).emit("react", null);
        }

        const msg = await MessageModel.findById(messageId);
        await msg?.save();
        if (!msg?.reaction.includes(reaction.id)) {
          await msg?.updateOne({
            $addToSet: { reaction: reaction.id },
          });
          await msg?.save();
        }
        await MessageModel.findById(msg?.id).populate({
          path: "reaction",
          populate: {
            path: "user",
            populate: {
              path: "profile",
            },
          },
        });

        socket.to(conversationId).emit("unReact", data);
      });

      // React
      socket.on("react", (data) => {
        const {
          icon,
          messageId,
          conversationId,
          user: { id: userId },
        } = data;
        // Gửi sự kiện trả lại conversation
        socket.to(conversationId).emit("react", data);
        console.log("react:", data);

        if (userId) {
          //
          if (countUpdates.has(`${messageId}_${icon}_${userId}`)) {
            const debouncedFn = countUpdates.get(
              `${messageId}_${icon}_${userId}`
            );
            debouncedFn(data);
          } else {
            const debouncedFn = _.debounce(async (data: any) => {
              const {
                messageId,
                user: { id: userId },
                count,
                icon,
              } = data;

              // Tiến hành cập nhật mongodb
              try {
                const reaction = await ReactionModel.findOneAndUpdate(
                  {
                    messageId,
                    user: userId,
                  },
                  {
                    [`reacts.${icon}`]: count,
                  },
                  { upsert: true, new: true }
                );
                if (!reaction) {
                  socket.to(conversationId).emit("react", null);
                }

                const msg = await MessageModel.findById(messageId);
                await msg?.save();
                if (!msg?.reaction.includes(reaction.id)) {
                  await msg?.updateOne({
                    $addToSet: { reaction: reaction.id },
                  });
                  await msg?.save();
                }
                await MessageModel.findById(msg?.id).populate({
                  path: "reaction",
                  populate: {
                    path: "user",
                    populate: {
                      path: "profile",
                    },
                  },
                });
                socket.to(conversationId).emit("react", data);
              } catch (err) {
                console.log(err);
                socket.to(conversationId).emit("react", data);
              }

              // Sau khi lưu thành công, xóa hàm debounce của msgId này khỏi Map
              countUpdates.delete(`${messageId}_${icon}_${userId}`);
            }, 1000); // Trì hoãn 1 giây trước khi lưu vào database

            // Lưu hàm debounce mới vào Map cho msgId này
            countUpdates.set(`${messageId}_${icon}_${userId}`, debouncedFn);

            // Gọi hàm debounce mới để lưu message vào database
            debouncedFn(data);
          }
        }
      });

      socket.on("join_room", (conversationId) => {
        socket.join(conversationId);
      });
      socket.on("sign_token", (token) => {
        if (socket.user) {
          (tokenByUserId as any)[socket.user.id] = token;
        }
      });

      socket.on("send_message", async (data) => {
        if (socket.user) {
          socket.broadcast
            .to(data.conversation)
            .emit("someone_sent_message", data);
          io.to(data.conversation).emit("notification", {
            type: "new_message",
            data,
          });

          // Lấy danh sách token theo thành viên trong hộp thoại
          const conversation = await ConversationModel.findById(
            data.conversation
          ).populate({
            path: "lastMessage",
            populate: {
              path: "sender",
              populate: "profile",
            },
          });
          const tokens = conversation?.members
            .filter((el) => el.toString() !== socket.user.id)
            .map((m) => {
              return (tokenByUserId as any)[m as any] as string;
            })
            .filter((el) => el);

          try {
            // Gửi thông báo
            if (tokens && tokens.length > 0) {
              // Xử lý hiển thị tin nhắn có tag
              const regex = /@\[\_\_(\w+)\_\_\]\(\_\_(.+?)\_\_\)/g;
              const msg = (conversation?.lastMessage as any)?.content;
              let formattedString = msg.replace(
                regex,
                (match: string, p1: string, p2: string) => {
                  const name = p2;
                  return `@${name}`;
                }
              );

              formattedString =
                (formattedString as string).substring(0, 50) +
                ((formattedString as string).length > 50 ? "..." : "");

              const tagTokens = (data?.tags as String[])
                .filter((el) => el.toString() !== socket.user.id)
                .map((m) => {
                  return (tokenByUserId as any)[m as any] as string;
                })
                .filter((el) => el);

              tokens.forEach(async (t) => {
                console.log("Firebase Token:::", t);
                await admin?.messaging().send({
                  notification: {
                    title: `${
                      conversation?.type === "group"
                        ? conversation.name + ": "
                        : ""
                    }Có tin nhắn mới từ ${
                      (conversation?.lastMessage as any)?.sender?.profile?.name
                    }`,
                    body: !(conversation?.lastMessage as any).isSticker
                      ? tagTokens.includes(t)
                        ? "Đã tag bạn vào một tin nhắn"
                        : `${
                            (conversation?.lastMessage as any).attachment
                              ? "Đã gửi một tập tin"
                              : formattedString
                          }`
                      : "Đã gửi một nhãn dán",
                  },
                  data: {
                    conversationId: conversation?.id,
                    title: `${
                      conversation?.type === "group"
                        ? conversation.name + ": "
                        : ""
                    }Có tin nhắn mới từ ${
                      (conversation?.lastMessage as any)?.sender?.profile?.name
                    }`,
                    body: !(conversation?.lastMessage as any).isSticker
                      ? tagTokens.includes(t)
                        ? "Đã tag bạn vào một tin nhắn"
                        : `${
                            (conversation?.lastMessage as any).attachment
                              ? "Đã gửi một tập tin"
                              : formattedString
                          }`
                      : "Đã gửi một nhãn dán",
                  },
                  token: t,
                });
              });
            }
          } catch (error) {
            console.log("Lỗi kết nối firebase");
            console.log(error);
            initializeFirebaseAdmin();
          }
        }
      });

      socket.on("add_friend_request", async (data) => {
        const {
          from: {
            id: userFromId,
            profile: { name },
          },
          to: { id: userId },
        } = data;

        try {
          if (userFromId) {
            if (addFriendUpdates.has(`${userFromId}_${userId}`)) {
              const debouncedFn = addFriendUpdates.get(
                `${userFromId}_${userId}`
              );
              debouncedFn(data);
            } else {
              const debouncedFn = _.debounce(async (data: any) => {
                // Firebase gửi thông báo có người kết bạn
                if ((tokenByUserId as any)[userId]) {
                  await admin?.messaging().sendMulticast({
                    notification: {
                      title: "Lời mời kết bạn",
                      body: `Bạn có mời lời kết bạn từ ${name}`,
                    },
                    data: {
                      title: "Lời mời kết bạn",
                      body: `Bạn có mời lời kết bạn từ ${name}`,
                    },
                    tokens: [(tokenByUserId as any)[userId]],
                  });
                }

                // Sau thông báo thành công, xóa hàm debounce của msgId này khỏi Map
                addFriendUpdates.delete(`${userFromId}_${userId}`);
              }, 3000); // Trì hoãn 3 giây

              // Lưu hàm debounce mới vào Map
              addFriendUpdates.set(`${userFromId}_${userId}`, debouncedFn);

              debouncedFn(data);
            }
          }
        } catch (error) {
          console.log("Lỗi kết nối firebase");
          console.log(error);
          initializeFirebaseAdmin();
        }

        socket.to(userId).emit("has_request", data);
      });

      socket.on("disgroup", (data) => {
        const { conversationId } = data;
        socket.to(conversationId).emit("disgroup", conversationId);
      });

      socket.on("change_avt_group", (data) => {
        const { groupId } = data;
        socket.to(groupId).emit("change_avt_group", data);
      });

      socket.on("change_name_group", (data) => {
        const { groupId } = data;
        socket.to(groupId).emit("change_name_group", data);
      });

      socket.on("new_members", async (data) => {
        const { conversation } = data;
        const tmp = conversation.members.map((el: any) => el.id);

        async function fetchMembers(users: string[]) {
          return await UserModel.find({ _id: users }).populate("profile");
        }

        socket.broadcast
          .to(data.members)
          .to(tmp)
          .emit("new_members", {
            ...data,
            user: await fetchMembers(data.members),
          });
      });
      socket.on("accept", async (data) => {
        const { userId, conversationId } = data;
        // Join room trên sv
        socket.join(conversationId);

        const targetSocket = io.sockets.sockets.get(socket.user.id);
        if (targetSocket) {
          targetSocket.join(conversationId);
        }

        async function callReq(id: string) {
          // Lấy danh sách hộp thoại mà người dùng là thành viên trong đó
          const conver = await ConversationModel.findById(id)
            .populate({
              path: "lastMessage",
              populate: {
                path: "attachment",
              },
            })
            .populate({
              path: "lastMessage",
              populate: [
                {
                  path: "reaction",
                  populate: {
                    path: "user",
                    populate: {
                      path: "profile",
                    },
                  },
                },
                {
                  path: "sender",
                  populate: {
                    path: "profile",
                  },
                },
                {
                  path: "reply",
                  populate: [
                    {
                      path: "reaction",
                      populate: {
                        path: "user",
                        populate: {
                          path: "profile",
                        },
                      },
                    },
                    {
                      path: "sender",
                      populate: {
                        path: "profile",
                      },
                    },
                    {
                      path: "attachment",
                    },
                  ],
                },
              ],
            })
            .populate({
              path: "members",
              populate: {
                path: "profile",
              },
            })
            .populate({
              path: "conversationReadByUser",
            });

          if (!conver) {
            return null;
          }

          const val = conver.conversationReadByUser.find(
            (item) => (item as any).userId.toString() === userId.toString()
          );

          return {
            ...conver.toJSON(),
            unreadCount: val ? (val as any)["__v"] : 1,
          };
        }

        socket
          .to(userId)
          .to(conversationId)
          .emit("someone_accept_request", {
            ...data,
            conversation: await callReq(conversationId),
            friend: await UserModel.findById(socket.user.id).populate(
              "profile"
            ),
          });
      });

      // từ chối kết bạn
      socket.on("reject", (data) => {
        const { userId } = data;
        if (socket.user) {
          socket.to(userId).emit("reject", socket.user.id);
        }
      });

      socket.on("delete_friend", (data) => {
        const { friendId } = data;

        if (socket.user) {
          socket.to(friendId).emit("delete_friend", socket.user.id);
        }
      });

      socket.on("unsend_message", (data) => {
        const { conversationId } = data;
        socket.to(conversationId).emit("unsend_message", data);
      });

      socket.on("leave_group", (data) => {
        const { conversationId } = data;
        socket.broadcast.to(conversationId).emit("leave_group", data);
        socket.leave(conversationId);
      });
      socket.on("kick_user", (data) => {
        const { conversationId, userId } = data;
        socket.broadcast.to(conversationId).emit("kick_user", data);
        socket.to(userId).emit("leave_group", data);
      });

      socket.on("grant_creator", (data) => {
        const { conversationId } = data;
        socket.broadcast.to(conversationId).emit("grant_creator", data);
      });
      socket.on("grant_admins", (data) => {
        const { conversationId } = data;
        socket.broadcast.to(conversationId).emit("grant_admins", data);
      });

      socket.on("remove_admin", (data) => {
        const { conversationId } = data;
        socket.to(conversationId).emit("remove_admin", data);
      });
    } catch (err) {
      console.log(err);
    }

    // Sự kiện có thành viên mới trong nhóm (create group, add members)
    socket.on("new_group", (data) => {
      // Join room tren sv
      socket.join(data.id);

      const { members } = data;
      members.map((el: any) => {
        socket.to(el.id).emit("new_group", data);
      });
    });

    socket.on("logout", async () => {
      if (!socket.user) {
        return;
      }

      console.log(
        "Nhan su kien logout get socket",
        socket.user.id,
        socket.id,
        (webByUserId as any)[socket.user.id],
        (mobileByUserId as any)[socket.user.id]
      );

      if (
        socket.platform === "Web" &&
        (webByUserId as any)[socket.user.id] === socket.id
      ) {
        delete (webByUserId as any)[socket.user.id];
      }

      if (
        socket.platform !== "Web" &&
        (mobileByUserId as any)[socket.user.id] === socket.id
      ) {
        console.log("ahihi:", socket.user.id, mobileByUserId);
        delete (mobileByUserId as any)[socket.user.id];
        delete (tokenByUserId as any)[socket.user.id];
      }

      // Cập nhật trạng thái online của người dùng khi cả 2 thiết bị đều không còn id
      if (
        !(webByUserId as any)[socket.user.id] &&
        !(mobileByUserId as any)[socket.user.id]
      ) {
        io.emit("user_offline", socket.user.id);
        await UserModel.findByIdAndUpdate(socket.user.id, { online: false });
      }

      socket.disconnect(true);
    });

    socket.on("disconnect", async () => {
      if (!socket.user) {
        return;
      }
      console.log("Một người dùng ngắt kết nối", socket.id);

      if (
        socket.platform === "Web" &&
        (webByUserId as any)[socket.user.id] === socket.id
      ) {
        delete (webByUserId as any)[socket.user.id];
      }

      if (
        socket.platform !== "Web" &&
        (mobileByUserId as any)[socket.user.id] === socket.id
      ) {
        delete (mobileByUserId as any)[socket.user.id];
      }

      // Cập nhật trạng thái online của người dùng khi cả 2 thiết bị đều không còn id
      if (
        !(webByUserId as any)[socket.user.id] &&
        !(mobileByUserId as any)[socket.user.id]
      ) {
        io.emit("user_offline", socket.user.id);
        await UserModel.findByIdAndUpdate(socket.user.id, { online: false });
      }
    });
  });
}

export default createSocket;

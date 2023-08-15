import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import AttachmentModel from "../../models/attachment-model";
import DeviceInfoModel from "../../models/device-info-model";
import MessageModel from "../../models/message-model";
import StickerModel from "../../models/sticker-model";
import UserModel from "../../models/user-model";

async function getCredentials(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  try {
    // Kiểm tra access token
    if (!req.user) {
      const err: HttpException = {
        name: "Không tìm thấy token",
        statusCode: 403,
        message: "Truy cập yêu cầu access token",
      };
      throw err;
    }
    // Lấy thông tin account từ token
    const user = await UserModel.findById(
      req.user.id
    ).populate([
      {
        path: "profile",
      },
      {
        path: "conversations",
        populate: [
          {
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
          },
          { path: "members", populate: "profile" },
          {
            path: "conversationReadByUser",
            populate: {
              path: "userId",
              populate: "profile",
            },
          },
        ],
        options: {
          sort: {
            "lastMessage.createdAt": -1,
            updatedAt: -1,
          },
        },
      },
      {
        path: "friendRequests",
        populate: [
          { path: "from", populate: "profile" },
          { path: "to", populate: "profile" },
        ],
      },
      {
        path: "friends",
        populate: {
          path: "profile",
        },
      },
    ]);
    // .populate("profile")
    // .populate({
    //   path: "conversations",
    //   populate: [
    //     {
    //       path: "lastMessage",
    //       populate: [
    //         {
    //           path: "attachment",
    //         },
    //         {
    //           path: "sender",
    //           populate: {
    //             path: "profile",
    //           },
    //         },
    //       ],
    //     },
    //     {
    //       path: "members",
    //       populate: {
    //         path: "profile",
    //       },
    //     },
    //     {
    //       path: "conversationReadByUser",
    //     },
    //   ],
    // })
    // .select("-password")
    // .populate({
    //   path: "friends",
    //   populate: {
    //     path: "profile",
    //   },
    // })
    // .populate({
    //   path: "friendRequests",
    //   populate: {
    //     path: "to",
    //     populate: {
    //       path: "profile",
    //     },
    //   },
    // })
    // .populate({
    //   path: "friendRequests",
    //   populate: {
    //     path: "from",
    //     populate: {
    //       path: "profile",
    //     },
    //   },
    // });
    if (!user) {
      const err: HttpException = {
        name: "Không tìm thấy người dùng",
        statusCode: 404,
        message: "Access token không hợp lệ",
      };
      throw err;
    }
    let _user: any = Object.assign({}, user.toJSON(), {
      requests: user.friendRequests,
    });
    delete _user.friendRequests;

    _user.conversations = await Promise.all(
      _user.conversations.map(async (el: any) => {
        const val = await el.conversationReadByUser.find(
          (item: any) => {
            return (
              (item as any).userId.id.toString() ===
              req.user?.id.toString()
            );
          }
        );

        return {
          ...el,
          unreadCount: val ? val["__v"] : 1,
          messages: await MessageModel.find({
            conversation: el.id,
            removeFor: { $nin: [req.user?.id] },
          })
            .populate([
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
                populate: "profile",
              },
              {
                path: "attachment",
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
            ])
            .sort({ createdAt: -1 }),
          attachments: await AttachmentModel.find({
            conversation: el.id,
          }),
        };
      })
    );

    _user.conversations.sort((a: any, b: any) => {
      // if (!a.lastMessage && !b.lastMessage) {
      //   return b.updatedAt - a.updatedAt;
      // }
      return (
        b.lastMessage?.createdAt - a.lastMessage?.createdAt
      );
    });
    // console.log(_user.conversations);

    // Lấy thông tin thiết bị
    const device = await DeviceInfoModel.findOne({
      userId: req.user.id,
    });

    //
    const stickers = await StickerModel.find({});

    // Ok, gửi kết quả trả về
    res.json({
      status: true,
      message: "Lấy thông tin người dùng thành công",
      device,
      user: {
        ..._user,
        stickers,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default getCredentials;

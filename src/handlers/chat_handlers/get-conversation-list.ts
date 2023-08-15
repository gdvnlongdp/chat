import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ConversationModel from "../../models/conversation-model";

async function getConversationList(
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
    // Lấy danh sách hộp thoại mà người dùng là thành viên trong đó
    const conversationList = await ConversationModel.find({
      members: req.user.id,
    })
      // .lean()
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
      })
      .sort({ updatedAt: -1 });

    const result = conversationList.map((el) => {
      const val = el.conversationReadByUser.find(
        (item) => (item as any).userId.toString() === req.user?.id.toString()
      );
      return {
        ...el.toJSON(),
        unreadCount: val ? (val as any)["__v"] : 1,
      };
    });

    // OK
    res.json({
      status: true,
      message: "Lấy danh sách hộp thoại thành công",
      conversationList: result,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default getConversationList;

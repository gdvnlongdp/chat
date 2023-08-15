import { Response } from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ConversationModel from "../../models/conversation-model";
import MessageModel from "../../models/message-model";

export const removeConversation = async (
  req: RequestWithUser,
  res: Response
) => {
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

    // Kiểm tra người dùng có trong hộp thoại hay không?
    const conversation = await ConversationModel.findOne({
      _id: req.params.conversationId,
      members: req.user.id,
    });
    if (!conversation) {
      const err: HttpException = {
        name: "Không tìm thấy hộp thoại",
        statusCode: 400,
        message: "Người dùng không có quyền truy cập hộp thoại này",
      };
      throw err;
    }

    const messages = await MessageModel.find({
      conversation: conversation.id,
    });
    messages.forEach(async (el) =>
      el.update({ $addToSet: { removeFor: req.user?.id } })
    );

    const _con = await ConversationModel.findById(conversation.id)
      // .lean()
      .populate({
        path: "lastMessage",
        populate: {
          path: "attachment",
        },
      })
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          populate: {
            path: "profile",
          },
        },
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

    res.json({
      status: true,
      message: "Xóa lịch sử trò chuyện tin nhắn thành công",
      conversation: _con,
    });
  } catch (err) {
    res.status(400).json({
      message: "Xóa lịch sử trò chuyện tin nhắn thất bại",
    });
    console.log(err);
  }
};

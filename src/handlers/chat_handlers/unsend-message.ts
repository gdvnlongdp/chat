import { Response } from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import MessageModel from "../../models/message-model";

export const unSendMessage = async (req: RequestWithUser, res: Response) => {
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

    const message = await MessageModel.findOneAndUpdate(
      {
        _id: req.params.messageId,
        senderId: req.user.id,
      },
      { unsend: true },
      { new: true }
    );

    if (!message) {
      const err: HttpException = {
        name: "Không tìm thấy token",
        statusCode: 400,
        message: "Thu hồi tin nhắn thất bại",
      };
      throw err;
    }

    res.json({
      status: true,
      message: "Thu hồi tin nhắn thành công",
      conversationId: message.conversation,
      messageId: message.id,
    });
  } catch (err) {
    res.status(400).json({
      message: "Thu hồi tin nhắn thất bại",
    });
    console.log(err);
  }
};

import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ConversationModel from "../../models/conversation-model";

async function getLastMessage(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
) {
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

    // Kiểm tra người dùng có quyền truy cập không
    const conversation = await ConversationModel.findOne({
      _id: req.params.conversationId,
      members: req.user.id,
    }).populate("lastMessage");

    if (!conversation) {
      const err: HttpException = {
        name: "Không tìm thấy hộp thoại",
        statusCode: 403,
        message: "Người dùng không có quyền truy cập",
      };
      throw err;
    }

    res.json({
      status: true,
      message: "Lấy tin nhắn cuối cùng của hộp thoại thành công",
      lastMesage: conversation.lastMessage,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default getLastMessage;

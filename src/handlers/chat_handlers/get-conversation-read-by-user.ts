import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ConversationModel from "../../models/conversation-model";

async function getConversationReadByUser(
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

    const conversation = await ConversationModel.findOne({
      _id: req.params.id,
      members: req.user.id,
    }).populate({
      path: "conversationReadByUser",
      populate: {
        path: "userId",
        populate: "profile",
      },
    });

    res.json({
      status: true,
      message: "Lấy danh sách người dùng đọc tin nhắn thành công",
      conversationReadByUser: conversation?.conversationReadByUser,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default getConversationReadByUser;

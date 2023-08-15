import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ConversationModel from "../../models/conversation-model";
import MessageModel from "../../models/message-model";

async function getChatLogById(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  try {
    // Ràng buộc đầu vào
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      const err: HttpException = {
        name: "Lỗi ràng buộc đầu vào",
        statusCode: 403,
        message: errs.array()[0].msg,
      };
      throw err;
    }

    // Kiểm tra access token
    if (!req.user) {
      const err: HttpException = {
        name: "Không tìm thấy token",
        statusCode: 403,
        message: "Truy cập yêu cầu access token",
      };
      throw err;
    }

    // Kiểm tra người dùng có thuộc hộp thoại này hay không
    const conversation = await ConversationModel.findOne({
      _id: req.params.conversationId,
      members: req.user.id,
    });
    if (!conversation) {
      const err: HttpException = {
        name: "Không tìm thấy hộp thoại",
        statusCode: 404,
        message: "Người dùng không phải có trong hộp thoại này",
      };
      throw err;
    }

    // Tiến hành lấy danh sách tin nhắn của hộp thoại
    const messageList = await MessageModel.find({
      conversation: conversation.id,
    })
      .sort({ createdAt: -1 })
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
      ])
      .populate("attachment");

    res.json({
      status: true,
      message: "Lấy danh sách tin nhắn của hộp thoại thành công",
      messageList,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default getChatLogById;

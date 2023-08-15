import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ConversationModel from "../../models/conversation-model";
import ConversationReadByUserModel from "../../models/conversation-read-by-user-model";

async function markAsSeen(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
) {
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

    // Đánh dấu đã đọc bởi ai đó
    const date = new Date();
    date.setHours(date.getHours() + 7);
    const conversationReadByUser =
      await ConversationReadByUserModel.findOneAndUpdate(
        {
          conversationId: req.params.conversationId,
          userId: req.user.id,
        },
        { $set: { readAt: date, __v: 0 } },
        { new: true, upsert: true }
      );

    // Tìm kiếm conversation
    const converation = await ConversationModel.findOneAndUpdate(
      {
        _id: req.params.conversationId,
        members: req.user.id,
      },
      {
        $pull: {
          unread: req.user.id,
        },
      },
      { new: true }
    );
    if (
      !converation?.conversationReadByUser.includes(
        conversationReadByUser.id.toString()
      )
    ) {
      await converation?.updateOne({
        $addToSet: { conversationReadByUser: conversationReadByUser.id },
      });
      await converation?.save();
    }

    if (!converation) {
      const err: HttpException = {
        name: "Không tìm thấy hộp thoại",
        statusCode: 400,
        message: "Không có quyền truy cập hộp thoại này",
      };
      throw err;
    }

    // Ok
    res.json({
      status: true,
      message: "Đánh dấu đã đọc tin nhắn thành công",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default markAsSeen;

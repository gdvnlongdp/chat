// Chỉ có chủ phòng và phó phòng được quyền kick user thường
// Chủ phòng được kick cả phó phòng
import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ConversationModel from "../../models/conversation-model";
import UserModel from "../../models/user-model";

async function disGroup(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
) {
  const { conversationId } = req.params;

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

    const conversation = await ConversationModel.findOne({
      _id: conversationId,
      members: req.user.id,
      type: "group",
    });
    if (!conversation) {
      const err: HttpException = {
        name: "Không tìm thấy hộp thoại",
        statusCode: 400,
        message: "Thao tác thất bại",
      };
      throw err;
    }
    if (!conversation.members.includes(req.user.id)) {
      const err: HttpException = {
        name: "Không có quyền truy cập",
        statusCode: 400,
        message: "Không có quyền trong hộp thoại này",
      };
      throw err;
    }

    // Kiểm tra người dùng này là ai, (chủ phòng, phó phòng hay user thường)
    let role: string = "";
    if (
      conversation.creator.toString() ===
      req.user.id.toString()
    ) {
      role = "creator";
    }

    if (role !== "creator") {
      const err: HttpException = {
        name: "Không có quyền truy cập",
        statusCode: 400,
        message:
          "Chỉ có chủ phòng mới được quyền giải tán nhóm",
      };
      throw err;
    }

    // Tiến hành giải tán nhóm
    await conversation.update({
      $set: {
        members: [],
        creator: null,
        admins: [],
      },
    });
    conversation.members.map(async (userId) => {
      await UserModel.findByIdAndUpdate(userId, {
        $pull: { conversations: conversation.id },
      });
    });

    // Ok
    res.json({
      status: true,
      message: "Đá người dùng khỏi phòng thành công",
      conversation,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default disGroup;

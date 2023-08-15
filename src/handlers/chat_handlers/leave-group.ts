// Chỉ có chủ phòng và phó phòng được quyền kick user thường
// Chủ phòng được kick cả phó phòng
import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ConversationModel from "../../models/conversation-model";
import UserModel from "../../models/user-model";

async function leaveGroup(
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
    });
    if (!conversation) {
      const err: HttpException = {
        name: "Không tìm thấy hộp thoại",
        statusCode: 400,
        message: "Không tìm thấy hộp thoại",
      };
      throw err;
    }
    if (conversation.type !== "group") {
      const err: HttpException = {
        name: "Không phải hộp thoại nhóm",
        statusCode: 400,
        message: "Không phải hộp thoại nhóm",
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

    // Kiểm tra bạn phải là chủ phòng không, nếu là chủ phòng
    // Không được rời phòng
    if (conversation.creator.toString() === req.user.id.toString()) {
      const err: HttpException = {
        name: "Không được rời phòng",
        statusCode: 400,
        message: "Bạn là chủ phòng, chủ phòng không được phép rời phòng",
      };
      throw err;
    }

    // Tiến hành rời phòng
    await conversation.update({
      $pull: {
        members: req.user.id,
        admins: req.user.id,
      },
    });
    await conversation.save();
    await UserModel.findByIdAndUpdate(req.user.id, {
      $pull: { conversations: conversation.id },
    });

    // Ok
    res.json({
      status: true,
      message: "Rời phòng thành công",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default leaveGroup;

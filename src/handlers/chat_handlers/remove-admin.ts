// Chỉ có chủ phòng và phó phòng được quyền kick user thường
// Chủ phòng được kick cả phó phòng
import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ConversationModel from "../../models/conversation-model";

async function removeAdmin(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
) {
  const { conversationId } = req.params;
  const { userId } = req.body;

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

    // Nếu người dùng không phải chủ phòng (từ chối thực hiện thao tác)
    if (conversation.creator.toString() !== req.user.id.toString()) {
      const err: HttpException = {
        name: "Không có quyền",
        statusCode: 400,
        message:
          "Bạn không phải chủ phòng, không có quyền thực hiện thao tác này",
      };
      throw err;
    }

    // Tiến hành xóa admin biến người dùng thành người dùng thường
    await conversation.update({ $pull: { admins: userId } });
    await conversation.save();

    const _con = await conversation.populate([
      {
        path: "lastMessage",
        populate: {
          path: "attachment",
        },
      },
      {
        path: "lastMessage",
        populate: {
          path: "sender",
          populate: {
            path: "profile",
          },
        },
      },
      {
        path: "members",
        populate: {
          path: "profile",
        },
      },
      {
        path: "conversationReadByUser",
      },
    ]);

    // Ok
    res.json({
      status: true,
      message: "Loại bỏ phó phòng thành công",
      conversation: _con,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default removeAdmin;

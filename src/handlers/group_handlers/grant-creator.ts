import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ConversationModel from "../../models/conversation-model";

async function grantCreator(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
) {
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

    // Kiểm tra chủ phòng
    const conversation = await ConversationModel.findOne({
      _id: req.params.conversationId,
      creator: req.user.id,
      type: "group",
    });
    if (!conversation) {
      const err: HttpException = {
        name: "Không tìm thấy hộp thoại",
        statusCode: 400,
        message: "Người dùng không phải chủ phòng",
      };
      throw err;
    }

    // Kiểm tra người được thêm phải thuộc trong nhóm
    if (!conversation.members.includes(userId)) {
      const err: HttpException = {
        name: "Không tìm thấy người dùng trong nhóm",
        statusCode: 400,
        message: "Người được thêm không phải thành viên trong nhóm",
      };
      throw err;
    }

    // Tiến hành đổi chủ phòng, nếu người được thêm đang là phó phòng,
    // thì xóa sau khi nhượng quyền, xóa danh sách phó phòng
    await conversation.update({ $set: { creator: userId } });
    if (conversation.admins.includes(userId)) {
      await conversation.update({ $pull: { admins: userId } });
    }
    await conversation.save();

    const _con = await ConversationModel.findById(conversation.id)
      .populate({
        path: "creator",
        populate: {
          path: "profile",
        },
      })
      .populate({
        path: "admins",
        populate: {
          path: "profile",
        },
      })
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

    // Ok
    res.json({
      status: true,
      message: "Trao quyền chủ phòng cho người dùng thành công",
      conversation: _con,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default grantCreator;

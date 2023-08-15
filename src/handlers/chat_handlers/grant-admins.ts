import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ConversationModel from "../../models/conversation-model";

async function grantAdmins(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
) {
  const { adminIds } = req.body;

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

    // Admins chỉ được thêm tối đa 3 phó phòng
    if (conversation.admins.length + adminIds > 3) {
      const err: HttpException = {
        name: "Phó phòng quá nhiều",
        statusCode: 400,
        message: "Phòng chỉ được thêm tối đa 3 phó phòng",
      };
      throw err;
    }

    // Thêm quyền phó phòng cho những người này
    // Trước tiên, kiểm trả tất cả người này có trong group hay không
    (adminIds as string[]).forEach((el) => {
      if (!conversation.members.includes(el as any)) {
        const err: HttpException = {
          name: "Không có quyền truy cập",
          statusCode: 403,
          message:
            "Bạn đã thêm người không phải thành viên trong nhóm làm phó phòng",
        };
        throw err;
      }
    });

    // Tiếp theo, thêm nhưng người này làm phó phòng
    await conversation.update({ $addToSet: { admins: adminIds } });
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
      message: "Thêm phó phòng thành công cho nhóm",
      conversation: _con,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default grantAdmins;

import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ChangeGroupNameDto from "../../dtos/group/change-group-name-dto";
import ConversationModel from "../../models/conversation-model";

async function changeGroupName(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
) {
  const { name }: ChangeGroupNameDto = req.body;
  try {
    // Ràng buộc đầu vào
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      const err: HttpException = {
        name: "Lỗi ràng buộc đầu vào",
        statusCode: 400,
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
    //
    const _con = await ConversationModel.findOne({
      _id: req.params.groupId,
      type: "group",
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
      // .populate({
      //   path: "members",
      //   populate: {
      //     path: "profile",
      //   },
      // })
      .populate({
        path: "conversationReadByUser",
      });

    if (!_con) {
      const err: HttpException = {
        name: "Không tồn tại",
        statusCode: 404,
        message: "Không tìm thấy hộp thoại",
      };
      throw err;
    }
    if (!_con.members.includes(req.user.id)) {
      const err: HttpException = {
        name: "Không có quyền",
        statusCode: 400,
        message: "Người dùng không có quyền truy cập hộp thoại này",
      };
      throw err;
    }

    // Kiểm tra người dùng có phải người quyền hay không
    if (
      _con.creator.toString() !== req.user.id.toString() &&
      !_con.admins.includes(req.user.id)
    ) {
      const err: HttpException = {
        name: "Không có quyền",
        statusCode: 400,
        message:
          "Chỉ có trường phòng và phó phòng mới có quyền thay đổi tên nhóm",
      };
      throw err;
    }
    await _con.updateOne({ $set: { name } });
    await _con.save();

    // Ok, gửi kết quả trả về
    res.json({
      status: true,
      message: "Đổi tên nhóm thành công",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default changeGroupName;

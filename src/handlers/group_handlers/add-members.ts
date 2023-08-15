import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import AddMemberDto from "../../dtos/group/add-member-dto";
import ConversationModel from "../../models/conversation-model";
import UserModel from "../../models/user-model";

async function addMember(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const { userIds }: AddMemberDto = req.body;
  try {
    console.log(userIds);
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
    // Thêm thành viên vào nhóm
    const conversation = await ConversationModel.findOneAndUpdate(
      {
        _id: req.params.id,
        members: req.user.id,
        type: "group",
      },
      { $addToSet: { members: userIds.map((el) => el.toString()) } },
      { new: true }
    );
    // Thêm conversation vào user
    userIds.forEach(async (el) => {
      await UserModel.findByIdAndUpdate(el, {
        $addToSet: { conversations: conversation?.id },
      });
    });
    // const group = await GroupModel.findOneAndUpdate(
    //   {
    //     _id: req.params.groupId,
    //     members: req.user.id,
    //   },
    //   {
    //     $push: { members: userIds },
    //   },
    //   { new: true }
    // );
    if (!conversation) {
      const err: HttpException = {
        name: "Nhóm không tồn tại",
        statusCode: 404,
        message: "Nhóm không tồn tại",
      };
      throw err;
    }
    // Ok, gửi kết quả trả về
    res.json({
      status: true,
      message: "Thêm người dùng vào nhóm thành công",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default addMember;

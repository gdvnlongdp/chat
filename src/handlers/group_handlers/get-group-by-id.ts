import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ConversationModel from "../../models/conversation-model";

async function getGroupById(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
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
    // Kiểm tra người dùng truy cập có phải thuộc group này không
    const conversation = await ConversationModel.findOne({
      _id: req.params.id,
      members: req.user.id,
      type: "group",
    });
    if (!conversation) {
      const err: HttpException = {
        name: "Không tìm thấy hộp thoại",
        statusCode: 404,
        message: "Không tìm thấy nhóm yêu cầu",
      };
      throw err;
    }
    // Ok, gửi kết quả trả về
    res.json({
      status: true,
      message: "Lấy thông tin một nhóm trong danh sách thành công",
      group: conversation,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default getGroupById;

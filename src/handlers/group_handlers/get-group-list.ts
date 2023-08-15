import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ConversationModel from "../../models/conversation-model";

async function getGroupList(
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
    // Tìm danh sách nhóm có người dùng truy cập chính thành viên trong đó
    const conversationList = await ConversationModel.find({
      members: req.user.id,
      type: "group",
    }).populate("members");
    if (!conversationList) {
      const err: HttpException = {
        name: "Không tìm thấy hộp thoại",
        statusCode: 404,
        message: "Không tìm thấy nhóm",
      };
      throw err;
    }
    // Ok, gửi kết quả trả về
    res.json({
      status: true,
      message: "Lấy danh sách nhóm của người dùng thành công",
      groupList: conversationList,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default getGroupList;

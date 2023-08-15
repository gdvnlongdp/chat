import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import RelationshipModel from "../../models/relationship-model";

async function getFriendList(
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
    // Tiến hành lâý danh sách bạn bè từ hệ thống
    const friendList = await RelationshipModel.find({
      $or: [{ relatingUser: req.user.id }, { relatedUser: req.user.id }],
      blockedBy: { $ne: req.user.id },
    }).populate({
      path: "relatedUser",
      populate: {
        path: "profile",
      },
    });
    // Ok, gửi kết quả trả về
    res.json({
      status: true,
      message: "Lấy danh sách bạn bè thành công",
      friendList,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default getFriendList;

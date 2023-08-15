import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import UserModel from "../../models/user-model";

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

    const user = await UserModel.findById(req.user.id).populate({
      path: "friends",
      populate: {
        path: "profile",
      },
    });

    res.json({
      status: true,
      message: "Lấy danh sách bạn bè thành công",
      friendList: user?.friends,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default getFriendList;

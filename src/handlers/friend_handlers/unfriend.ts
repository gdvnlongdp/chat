import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import UserModel from "../../models/user-model";

async function unfriend(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
) {
  const { userId } = req.body;
  try {
    console.log(userId);
    // Kiểm tra access token
    if (!req.user) {
      const err: HttpException = {
        name: "Không tìm thấy token",
        statusCode: 403,
        message: "Truy cập yêu cầu access token",
      };
      throw err;
    }

    await UserModel.findByIdAndUpdate(req.user.id, {
      $pull: { friends: userId },
    });
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { friends: req.user.id },
    });

    res.json({
      status: true,
      message: "Xóa bạn thành công",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default unfriend;

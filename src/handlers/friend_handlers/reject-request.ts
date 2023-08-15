import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import FriendRequestModel from "../../models/friend-request-model";
import UserModel from "../../models/user-model";

async function rejectRequest(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const { userId } = req.body;
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

    const request =
      await FriendRequestModel.findOneAndDelete({
        from: userId,
        to: req.user.id,
        status: "pending",
      });
    if (!request) {
      const err: HttpException = {
        name: "Không tìm thấy yêu cầu",
        statusCode: 404,
        message: "Không tìm thấy yêu cầu",
      };
      throw err;
    }

    const user = await UserModel.findById(req.user.id);
    await user?.updateOne({
      $pull: { friendRequests: request.id },
    });
    await user?.save();

    const userTo = await UserModel.findById(userId);
    await userTo?.updateOne({
      $pull: { friendRequests: request.id },
    });
    await userTo?.save();

    res.json({
      status: true,
      message: "Từ chối kết bạn thành công",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default rejectRequest;

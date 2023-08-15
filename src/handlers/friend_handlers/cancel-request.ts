import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import FriendRequestModel from "../../models/friend-request-model";
import UserModel from "../../models/user-model";

async function cancelRequest(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const { requestId, userId } = req.body;

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
      await FriendRequestModel.findByIdAndDelete(requestId);
    if (!request) {
      // Kiêm tra list friend coi đã là bạn bè chưa
      const user = await UserModel.findById(userId);
      if (user?.friends.includes(req.user.id)) {
        res.status(404).json({
          status: false,
          message: "Không tìm thấy yêu cầu",
          isFriend: true,
        });
        return;
      }

      const err: HttpException = {
        name: "Không tìm thấy yêu cầu",
        statusCode: 404,
        message: "Không tìm thấy yêu cầu",
      };
      throw err;
    }

    const user = await UserModel.findById(request.from);
    await user?.updateOne({
      $pull: { friendRequests: request.id },
    });
    await user?.save();

    const userTo = await UserModel.findById(request.to);
    await userTo?.updateOne({
      $pull: { friendRequests: request.id },
    });
    await userTo?.save();

    res.json({
      status: true,
      message: "Hủy lệnh kết bạn thành công",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default cancelRequest;

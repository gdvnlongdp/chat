import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import FriendRequestModel from "../../models/friend-request-model";
import UserModel from "../../models/user-model";

async function addFriend(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const { userId } = req.body;
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

    const friendRequest = new FriendRequestModel({
      from: req.user.id,
      to: userId,
    });

    const friendRequestPopulated =
      await FriendRequestModel.populate(friendRequest, [
        {
          path: "to",
          populate: {
            path: "profile",
          },
        },
        {
          path: "from",
          populate: {
            path: "profile",
          },
        },
      ]);

    await UserModel.findByIdAndUpdate(
      req.user.id,
      { $push: { friendRequests: friendRequest.id } },
      { new: true }
    );

    const test = await UserModel.findByIdAndUpdate(
      userId,
      { $push: { friendRequests: friendRequest.id } },
      { new: true }
    );

    await friendRequest.save();

    res.json({
      status: true,
      message: "Gửi kết bạn thành công",
      friendRequest: friendRequestPopulated,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default addFriend;

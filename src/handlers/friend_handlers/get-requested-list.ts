import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import FriendModel from "../../models/friend-model";

async function getRequestedList(
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

    const requestedList = await FriendModel.find({
      recipient: req.user.id,
      status: 1,
    }).populate({
      path: "requester",
      populate: {
        path: "profile",
      },
      select: "-friends",
    });

    res.json({
      status: true,
      message: "Lấy danh sách được gửi yêu cầu kết bạn thành công",
      requestedList,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default getRequestedList;

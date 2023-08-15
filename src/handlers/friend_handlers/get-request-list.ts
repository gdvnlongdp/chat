import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import FriendRequestModel from "../../models/friend-request-model";

async function getRequestList(
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

    // const requestList = await FriendModel.find({
    //   requester: req.user.id,
    //   status: 1,
    // }).populate({
    //   path: "recipient",
    //   populate: {
    //     path: "profile",
    //   },
    //   select: "-friends",
    // });

    const requests = await FriendRequestModel.find({
      to: req.user.id,
      status: "pending",
    }).populate("from");
    console.log(requests);

    res.json({
      status: true,
      message: "Lấy danh sách gửi yêu cầu kết bạn thành công",
      requests,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default getRequestList;

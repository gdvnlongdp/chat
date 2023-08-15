import express from "express";
import RequestWithUser from "../../@types/request-with-user";
import NotificationModel from "../../models/notification-model";

async function getUnreadNoti(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const notis = await NotificationModel.find({
      userId: req.user?.id,
      read: false,
    });
    res.json({
      status: true,
      message: "Lấy danh sách thông báo chưa đọc của người dùng thành công",
      notifications: notis,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default getUnreadNoti;

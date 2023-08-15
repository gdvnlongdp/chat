import express from "express";
import RequestWithUser from "../../@types/request-with-user";
import NotificationModel from "../../models/notification-model";

async function markAsRead(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const noti = await NotificationModel.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user?.id,
      },
      { read: true },
      { new: true }
    );
    res.json({
      status: true,
      message: "Đánh dấu thông báo đã đọc thành công",
      notification: noti,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default markAsRead;

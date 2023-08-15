import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import DeviceModel from "../../models/device-model";

async function regisDevice(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
) {
  const { token } = req.body;
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

    const device = await DeviceModel.findOneAndUpdate(
      { userId: req.user.id },
      { token },
      { upsert: true }
    );
    if (!device) {
      const err: HttpException = {
        name: "Không tìm thấy thiết bị",
        statusCode: 400,
        message: "Đăng ký token cho thiết bị không thành công",
      };
      throw err;
    }

    res.json({
      status: true,
      message: "Đăng ký token thiết bị thành công",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default regisDevice;

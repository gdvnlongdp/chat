import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import DeviceModel from "../../models/device-model";

async function updateToken(
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
    const devices = await DeviceModel.findOneAndUpdate(
      { userId: req.user.id },
      { token },
      { new: true }
    );
    if (!devices) {
      const err: HttpException = {
        name: "Không tìm thấy device",
        statusCode: 400,
        message: "Cập nhật token từ thiết bị thất bại",
      };
      throw err;
    }
    res.json({
      status: true,
      message: "Câp nhận token từ thiết bị thành công",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default updateToken;

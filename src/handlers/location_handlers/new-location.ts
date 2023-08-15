import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import LocationModel from "../../models/location";

async function createLocate(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const { longitude, latitude, ip, mac, token, device, checked, platform } =
    req.body;

  // console.log(
  //   "debug:",
  //   req.ip,
  //   req.socket.remoteAddress,
  //   req.headers["x-forwarded-for"]
  // );

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

    // Tiến hành lưu tọa độ
    const newLocate = new LocationModel({
      userId: req.user.id,
      longitude,
      latitude,
      ip,
      mac,
      platform,
      token,
      checked,
      device,
    });
    newLocate.save();

    // Ok, gửi kết quả trả về
    res.json({
      status: true,
      message: "Ghi tọa độ thành công",
      locate: newLocate,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default createLocate;

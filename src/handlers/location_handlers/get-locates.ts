import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import LocationModel from "../../models/location";

async function getLocates(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
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
    const { start, end } = req.query;
    // Kiểm tra access token
    if (!req.user) {
      const err: HttpException = {
        name: "Không tìm thấy token",
        statusCode: 403,
        message: "Truy cập yêu cầu access token",
      };
      throw err;
    }
    // Tìm kiếm tọa độ
    if (!start || !end) {
      const locates = await LocationModel.find({
        userId: req.params.userId,
      });

      // Ok, gửi kết quả trả về
      res.json({
        status: true,
        message: "Lấy danh sách tọa độ thành công",
        locates,
      });
    } else {
      const locates = await LocationModel.find({
        userId: req.params.userId,
        createdAt: {
          $gte: new Date(start as string),
          $lte: new Date(end as string),
        },
      });

      // Ok, gửi kết quả trả về
      res.json({
        status: true,
        message: "Lấy danh sách tọa độ thành công",
        locates,
      });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default getLocates;

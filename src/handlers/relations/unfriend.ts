import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import RelationshipModel from "../../models/relationship-model";

async function unfriend(
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
    // Tiến hành hủy kết bạn
    await RelationshipModel.findOneAndRemove({
      $or: [
        { relatingUser: req.user.id, relatedUser: userId },
        { relatingUser: userId, relatedUser: req.user.id },
      ],
    });
    // Ok, gửi kết quả trả về
    res.json({
      status: false,
      message: "Hủy kết bạn thành công",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default unfriend;

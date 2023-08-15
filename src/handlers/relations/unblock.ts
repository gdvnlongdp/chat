import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import UnblockDto from "../../dtos/relation/unblock-dto";
import RelationshipModel from "../../models/relationship-model";

async function unblock(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const { userId }: UnblockDto = req.body;
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
    // Tiến hành bỏ chặn người dùng
    const relationship = await RelationshipModel.findOneAndUpdate(
      {
        $or: [
          { relatingUser: req.user.id, relatedUser: userId },
          { relatingUser: userId, relatedUser: req.user.id },
        ],
        blockedBy: req.user.id,
      },
      { blockedBy: null },
      { new: true }
    );
    if (!relationship) {
      const err: HttpException = {
        name: "Không tồn tại mối quan hệ",
        statusCode: 400,
        message: "Không thể bỏ chặn người dùng",
      };
      throw err;
    }
    // Ok, gửi kết quả trả về
    res.json({
      status: true,
      message: "Bỏ chặn người dùng thành công",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default unblock;

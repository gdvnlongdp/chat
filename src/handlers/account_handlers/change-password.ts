import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ChangePasswordDto from "../../dtos/account/change-password-dto";
import UserModel from "../../models/user-model";

async function changePassword(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const { password, newPassword }: ChangePasswordDto = req.body;
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
    // Tìm user document để xử lý thay đổi mật khẩu
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      const err: HttpException = {
        name: "Không tìm thấy người dùng",
        statusCode: 400,
        message: "Id không khả dụng",
      };
      throw err;
    }
    // Kiểm tra mật khẩu cũ (password)
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const err: HttpException = {
        name: "Mật khẩu cũ không trùng khớp",
        statusCode: 400,
        message: "Mật khẩu cũ không trùng khớp",
      };
      throw err;
    }
    // Tiến hành đổi mật khẩu và lưu vào document
    user.password = newPassword;
    await user.save();
    // Ok, gửi response trả về kết quả
    res.json({
      status: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default changePassword;

import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import redisClient from "../../drivers/redis/init";
import ResetPasswordDto from "../../dtos/auth/reset-password-dto";
import UserModel from "../../models/user-model";

async function resetPassword(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const { email, code, password }: ResetPasswordDto = req.body;
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
    // Kiểm tra mã khôi phục
    const otp = await redisClient.get(`reset_password_${email}`);
    if (code !== otp) {
      const err: HttpException = {
        name: "Sai mã khôi phục",
        statusCode: 400,
        message: "Mã khôi phục không hợp lệ",
      };
      throw err;
    }
    // Sau khi xác minh thành công mã khôi phục, tiến hành thay đổi mật khẩu
    const user = await UserModel.findOne({ email });
    if (!user) {
      const err: HttpException = {
        name: "Không tìm thấy tài khoản",
        statusCode: 404,
        message: "Tài khoản không tồn tại",
      };
      throw err;
    }
    user.password = password;
    await user.save();
    // Sau khi khôi phục mật khẩu cho tài khoản thành công, tiến hành xóa cache
    await redisClient.del(`reset_password_${email}`);
    // Ok, gửi kết quả trả về
    res.json({
      status: true,
      message: "Khôi phục mật khẩu cho tài khoản thành công",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default resetPassword;

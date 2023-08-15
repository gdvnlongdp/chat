import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import redisClient from "../../drivers/redis/init";
import SendOtpResetPasswordDto from "../../dtos/auth/send-otp-reset-password-dto";
import mailTransport from "../../utils/mail-transport";
import randCode from "../../utils/rand-code";

async function sendOtpResetPassword(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const { email }: SendOtpResetPasswordDto = req.body;
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
    // Tạo một mã otp
    const code = randCode();
    // Gửi code đến email
    await mailTransport.sendMail({
      from: `Hệ thống chat GDVN`,
      to: email,
      subject: "Khôi phục mật khẩu",
      html: `Mã khôi phục mật khẩu của bạn là ${code}`,
    });
    // Lưu record vào cache với key là email (unique) và value là code được tạo
    await redisClient.set(`reset_password_${email}`, code, { EX: 300 });
    // Ok, gửi kết quả trả về
    res.json({
      status: true,
      message: `Gửi mã khôi phục mật khẩu thành công đến ${email}`,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default sendOtpResetPassword;

import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import redisClient from "../../drivers/redis/init";
import SendOtpDto from "../../dtos/auth/send-otp-dto";
import mailTransport from "../../utils/mail-transport";
import randCode from "../../utils/rand-code";
async function sendOtpRegister(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const { email }: SendOtpDto = req.body;
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
      subject: "Xác minh tài khoản",
      html: `Mã xác minh tài khoản của bạn là ${code}`,
    });
    // Lưu record vào cache với key là email (unique) và value là code được tạo
    await redisClient.set(`register_${email}`, code, { EX: 300 });
    // Ok, gửi kết quả trả về
    res.json({
      status: true,
      message: `Gửi mã xác minh thành công đến ${email}`,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default sendOtpRegister;

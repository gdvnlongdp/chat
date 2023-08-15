import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RegisterDto from "../../dtos/auth/register-dto";
import ProfileModel from "../../models/profile-model";
import UserModel from "../../models/user-model";

async function register(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const {
    username,
    email,
    password,
    name,
    dob,
    gender,
    phone,
  }: RegisterDto = req.body;
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
    // Kiểm tra email đã được sử dụng hay chưa
    const user = await UserModel.findOne({
      $or: [{ username }, { email }, { phone }],
    });
    if (user) {
      const err: HttpException = {
        name: "Tài khoản đã tồn tại",
        statusCode: 409,
        message: "Tài khoản đã được sử dụng",
      };
      throw err;
    }
    // Kiểm tra mã xác minh
    // const otp = await redisClient.get(`register_${email}`);
    // if (code !== otp) {
    //   const err: HttpException = {
    //     name: "Sai mã xác minh",
    //     statusCode: 400,
    //     message: "Mã xác minh không hợp lệ",
    //   };
    //   throw err;
    // }
    // Khi đã xác minh email ok, tiến hành đăng ký tài khoản
    const newProfile = new ProfileModel({
      name,
      dob,
      gender,
      phone,
    });
    const newUser = new UserModel({
      username,
      email,
      phone,
      password,
      profile: newProfile.id,
    });
    await newProfile.save();
    await newUser.save();
    // Ok, gửi kết quả trả về
    res.status(201).json({
      status: true,
      message: "Đăng ký tài khoản thành công",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default register;

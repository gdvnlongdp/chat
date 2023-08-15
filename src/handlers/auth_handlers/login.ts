import express from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import HttpException from "../../@types/http-exception";
import JwtPayload from "../../@types/jwt-payload";
import LoginDto from "../../dtos/auth/login-dto";
import DeviceInfoModel from "../../models/device-info-model";
import UserModel from "../../models/user-model";

async function login(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const {
    email,
    password,
    imei,
    ip,
    mac,
    token,
    device: _device,
  }: LoginDto = req.body;
  try {
    // Ràng buộc đầu vào
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
      const err: HttpException = {
        name: "Lỗi ràng buộc đầu vào",
        statusCode: 403,
        message: errs.array()[0].msg,
      };
      throw err;
    }
    // Kiểm tra tài khoản
    const user = await UserModel.findOne({
      $or: [{ username: email }, { email }, { phone: email }],
    }).populate("profile");
    if (!user) {
      const err: HttpException = {
        name: "Tài khoản không tồn tại",
        statusCode: 403,
        message: "Đăng nhập thất bại. Tài khoản hoặc mật khẩu không đúng",
      };
      throw err;
    }
    // So sánh mật khẩu
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const err: HttpException = {
        name: "Sai mật khẩu",
        statusCode: 403,
        message: "Đăng nhập thất bại. Email hoặc mật khẩu không đúng",
      };
      throw err;
    }

    // // Kiểm tra tài khoản đã được sử dụng trên thiết bị khác hay chưa
    // const dev = await DeviceInfoModel.findOne({ userId: user.id });
    // if (dev && dev.imei !== imei) {
    //   const err: HttpException = {
    //     name: "Device user đã tồn tại",
    //     statusCode: 403,
    //     message:
    //       "Không thể đăng nhập, tài khoản đã được sử dụng trên thiết bị khác",
    //   };
    //   throw err;
    // }

    // if (!dev) {
    //   // Đăng ký thiết bị trên user
    //   const newDevice = new DeviceInfoModel({
    //     userId: user.id,
    //     imei,
    //     ip,
    //     mac,
    //   });
    //   await newDevice.save();
    // }
    const device = await DeviceInfoModel.findOneAndUpdate(
      {
        userId: user.id,
      },
      {
        imei,
        ip,
        mac,
        token,
        device: _device,
      },
      { upsert: true, new: true }
    );

    const payload: JwtPayload = {
      id: user.id,
      profileId: user.profile._id,
    };
    // Tạo access token
    const accessToken = jwt.sign(
      payload,
      process.env.ACCESS_TOKEN_SECRET_KEY as string,
      {
        expiresIn: "3d", // Thời gian sống của token là 15 phút
      }
    );
    // Tạo refresh token
    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET_KEY as string,
      {
        expiresIn: "1y", // Thời gian sống của token là 1 năm
      }
    );
    // Ok, gửi kết quả trả về
    res.json({
      status: true,
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default login;

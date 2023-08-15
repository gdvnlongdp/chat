import express from "express";
import { validationResult } from "express-validator";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import UpdateProfileDto from "../../dtos/profile/update-profile";
import ProfileModel from "../../models/profile-model";

async function updateProfile(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const { name, dob, gender, phone }: UpdateProfileDto = req.body;
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
    // Kiểm tra access token
    if (!req.user) {
      const err: HttpException = {
        name: "Không tìm thấy token",
        statusCode: 403,
        message: "Truy cập yêu cầu access token",
      };
      throw err;
    }

    const profile = await ProfileModel.findById(req.user.profileId);
    if (!profile) {
      const err: HttpException = {
        name: "Không tìm tháy hồ sơ",
        statusCode: 404,
        message: "Không tìm thấy hồ sơ người dùng",
      };
      throw err;
    }
    profile.name = name ?? profile.name;
    profile.dob = dob ?? profile.dob;
    if (gender === "male" || gender == "female") {
      profile.gender = gender ?? profile.gender;
    }
    profile.phone = phone ?? profile.phone;
    await profile.save();

    res.json({
      status: true,
      message: "Cập nhật hồ sơ thành công",
      profile,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default updateProfile;

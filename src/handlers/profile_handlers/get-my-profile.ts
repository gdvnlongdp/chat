import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ProfileModel from "../../models/profile-model";

async function getMyProfile(
  req: RequestWithUser,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  try {
    // Kiểm tra access token
    if (!req.user) {
      const err: HttpException = {
        name: "Không tìm thấy token",
        statusCode: 403,
        message: "Truy cập yêu cầu access token",
      };
      throw err;
    }
    // Lấy thông tin hồ sơ người dùng từ access token
    const profile = await ProfileModel.findById(req.user.profileId);
    if (!profile) {
      const err: HttpException = {
        name: "Không tìm thấy hồ sơ người dùng",
        statusCode: 404,
        message: "Không tìm thấy hồ sơ người dùng",
      };
      throw err;
    }
    // Ok, gửi kết quả trả về
    res.json({
      status: true,
      message: "Lấy thông tin hồ sơ người dùng thành công",
      profile,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default getMyProfile;

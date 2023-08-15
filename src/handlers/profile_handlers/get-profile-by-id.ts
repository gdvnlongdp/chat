import express from "express";
import HttpException from "../../@types/http-exception";
import ProfileModel from "../../models/profile-model";

async function getProfileById(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  try {
    // Lấy thông tin hồ sơ người dùng theo id
    const profile = await ProfileModel.findById(req.params.id);
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

export default getProfileById;

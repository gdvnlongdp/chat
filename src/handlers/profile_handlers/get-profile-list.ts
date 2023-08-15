import express from "express";
import ProfileModel from "../../models/profile-model";

async function getProfileList(
  _req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  try {
    const profileList = await ProfileModel.find({});
    // Ok, gửi kết quả trả về
    res.json({
      status: true,
      message: "Lấy danh sách hồ sơ người dùng thành công",
      profileList,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default getProfileList;

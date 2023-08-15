import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";
import ProfileModel from "../../models/profile-model";

async function uploadAvatar(
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
    // Kiểm tra file avatar
    if (!req.file) {
      const err: HttpException = {
        name: "Không tìm thấy ảnh đại diện của người dùng",
        statusCode: 404,
        message: "Yêu cầu tải lên ảnh đại diện",
      };
      throw err;
    }
    // Tiến hành tải ảnh đại diện vào cloudinary
    // const img = await uploadFromBuffer(req, {
    //   folder: `profile/${req.user.profileId}`,
    //   resource_type: "image",
    //   transformation: {
    //     width: 400,
    //     gravity: "auto",
    //     crop: "fill",
    //   },
    // });
    // Cập nhật đường link ảnh đại diện đã lấy được từ bước upload vào hồ sơ
    const profile = await ProfileModel.findByIdAndUpdate(
      req.user.profileId,
      {
        avatar: `${req.protocol}://${req.get("host")}/static/${
          req.file.filename
        }`,
      },
      { new: true }
    );
    if (!profile) {
      const err: HttpException = {
        name: "Không tìm thấy hồ sơ",
        statusCode: 404,
        message: "Hồ sơ không hợp lệ",
      };
      throw err;
    }
    // Ok, gửi kết quả trả về
    res.status(201).json({
      status: true,
      message: "Cập nhật ảnh đại diện người dùng thành công",
      profile,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default uploadAvatar;

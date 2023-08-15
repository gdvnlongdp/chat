import express from "express";
import HttpException from "../../@types/http-exception";
import RequestWithUser from "../../@types/request-with-user";

async function logout(
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

    // Tiến hành xóa thiét bị đăng nhập khỏi

    // Ok, gửi kết quả trả về
    res.json({
      status: true,
      message: "Đăng xuất thành công",
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default logout;

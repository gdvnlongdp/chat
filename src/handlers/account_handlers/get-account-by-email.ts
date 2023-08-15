import express from "express";
import HttpException from "../../@types/http-exception";
import UserModel from "../../models/user-model";
async function getAccountByEmail(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    let user = await UserModel.findOne({
      $or: [{ email: req.query.email }, { username: req.query.email }],
    }).populate("profile");

    // Tìm kiếm bằng số điện thoại
    const users = await UserModel.find().populate("profile");
    const _user = users.find(
      (item) => (item as any).profile.phone === req.query.email
    );
    if (_user) {
      user = _user;
    }

    if (!user) {
      const err: HttpException = {
        name: "Không tìm thấy người dùng",
        statusCode: 404,
        message: "Không tìm thấy người dùng",
      };
      throw err;
    }

    res.json({
      status: true,
      message: "Lấy thông tin người dùng thành công",
      user,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default getAccountByEmail;

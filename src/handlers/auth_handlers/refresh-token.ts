import express from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import HttpException from "../../@types/http-exception";
import JwtPayload from "../../@types/jwt-payload";
import RefreshTokenDto from "../../dtos/auth/refresh-token-dto";

async function refreshTokenHandler(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> {
  const { refreshToken }: RefreshTokenDto = req.body;
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

    // Kiểm tra refreshToken
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET_KEY as string
    ) as JwtPayload;

    // Tạo access token
    const accessToken = jwt.sign(
      { id: decoded.id, profileId: decoded.profileId },
      process.env.ACCESS_TOKEN_SECRET_KEY as string,
      {
        expiresIn: "3d", // Thời gian sống của token là 15 phút
      }
    );
    // Tạo refresh token
    const _refreshToken = jwt.sign(
      { id: decoded.id, profileId: decoded.profileId },
      process.env.REFRESH_TOKEN_SECRET_KEY as string,
      {
        expiresIn: "1y", // Thời gian sống của token là 1 năm
      }
    );

    // Ok, gửi response
    res.json({
      status: true,
      message: "Làm mới token thành công",
      accessToken,
      refreshToken: _refreshToken,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export default refreshTokenHandler;

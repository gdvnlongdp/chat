import express from "express";
import jwt from "jsonwebtoken";
import HttpException from "../@types/http-exception";
import JwtPayload from "../@types/jwt-payload";
import RequestWithUser from "../@types/request-with-user";

function verifyToken(
  req: RequestWithUser,
  _res: express.Response,
  next: express.NextFunction
): void {
  try {
    // Lấy Bearer Token từ header
    const token = req.header("authorization")?.split("Bearer ")[1];
    if (!token) {
      const err: HttpException = {
        name: "Xác minh token thất bại",
        statusCode: 403,
        message: "Hệ thống không tìm thấy token",
      };
      throw err;
    }
    // Giải mã token và truyền thông tin đã giải mã middlware kế tiếp
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET_KEY as string
    ) as JwtPayload;
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    if ((err as Error).name === "TokenExpiredError") {
      const _err: HttpException = {
        name: "Token hết hạn",
        statusCode: 401,
        message: "Token hết hạn",
      };
      next(_err);
    } else {
      next(err);
    }
  }
}

export default verifyToken;

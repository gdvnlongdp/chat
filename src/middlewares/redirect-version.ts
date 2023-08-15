import express from "express";
import HttpException from "../@types/http-exception";

function redirectVersion(payload: Record<string, express.RequestHandler>) {
  return function (
    this: Record<string, express.RequestHandler>,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    try {
      const version = req.header("x-api-version") || "v1";
      if (!payload[version]) {
        const err: HttpException = {
          name: "Không trùng khớp",
          statusCode: 400,
          message: "Phiên bản api không tồn tại",
        };
        next(err);
      }
      payload[version].call(this, req, res, next);
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
}

export default redirectVersion;

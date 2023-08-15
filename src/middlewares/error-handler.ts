import express from "express";
import HttpException from "../@types/http-exception";
import logger from "../utils/logger";

function errorHandler(
  err: HttpException,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Có gì đó sai sai";
  logger.error(err.name);
  res.status(statusCode).json({
    status: false,
    message,
  });
}

export default errorHandler;

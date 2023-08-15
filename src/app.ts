import cors from "cors";
import express, { Application } from "express";
import fs from "fs";
import helmet from "helmet";
import http from "http";
import https from "https";
import morgan from "morgan";
import mongoDriver from "./drivers/mongo";
import errorHandler from "./middlewares/error-handler";
import apiRouter from "./routes";
import createSocket from "./sockets/new-ver";
import logger from "./utils/logger";
import whitelist from "./utils/whitelist";
import * as dotenv from "dotenv";

dotenv.config()

const app: Application = express();
const server = http.createServer(app);

app.use("/public", express.static("public"));
app.use("/static", express.static("uploads"));

// Thiết lập các middleware cơ bản
app.use(
  cors({
    origin: whitelist,
    optionsSuccessStatus: 200,
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sử dụng morgan trên development mode
if (process.env.NODE_ENV === "development") {
  logger.debug("Hệ thống đang chạy dưới chế độ nhà phát triển (development)");
  app.use(morgan("dev"));
}

// Khởi tạo và kết nối với MongoDb
mongoDriver.init();
if (process.env.DB_URI) {
  logger.debug("Kết nối với dữ liệu hệ thống thông qua chuỗi kết nối");
  mongoDriver.connectDbByStringUrl(process.env.DB_URI as string);
} else {
  logger.debug("Kết nối với dữ liệu hệ thống thông qua tài khoản");
  mongoDriver.connectDbByAccount(
    process.env.DB_HOST as string,
    parseInt(process.env.DB_PORT as string),
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASS as string
  );
}

// redisClient
//   .connect()
//   .then(() => logger.info("Kết nối thành công với Redis"))
//   .catch((err) => {
//     logger.error("Kết nối tới Redis thất bại");
//     console.log(err);
//   });

// Khởi tạo socket
createSocket(server);

// Thiết lập chuyển hướng
app.use("/api", apiRouter);

// Xử lý lỗi
app.use(errorHandler);

// Chạy server
server.listen(8000, () =>
  logger.info("Server đã được khởi tạo và đang lắng nghe ... ")
);

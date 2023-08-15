"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
//import helmet from "helmet";
const http_1 = __importDefault(require("http"));
const morgan_1 = __importDefault(require("morgan"));
const mongo_1 = __importDefault(require("./drivers/mongo"));
const error_handler_1 = __importDefault(require("./middlewares/error-handler"));
const routes_1 = __importDefault(require("./routes"));
const new_ver_1 = __importDefault(require("./sockets/new-ver"));
const logger_1 = __importDefault(require("./utils/logger"));
const whitelist_1 = __importDefault(require("./utils/whitelist"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use("/public", express_1.default.static("public"));
app.use("/static", express_1.default.static("uploads"));
// Thiết lập các middleware cơ bản
app.use((0, cors_1.default)({
    origin: whitelist_1.default,
    optionsSuccessStatus: 200,
}));
//app.use(helmet());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Sử dụng morgan trên development mode
if (process.env.NODE_ENV === "development") {
    logger_1.default.debug("Hệ thống đang chạy dưới chế độ nhà phát triển (development)");
    app.use((0, morgan_1.default)("dev"));
}
// Khởi tạo và kết nối với MongoDb
mongo_1.default.init();
if (process.env.DB_URI) {
    logger_1.default.debug("Kết nối với dữ liệu hệ thống thông qua chuỗi kết nối");
    mongo_1.default.connectDbByStringUrl(process.env.DB_URI);
}
else {
    logger_1.default.debug("Kết nối với dữ liệu hệ thống thông qua tài khoản");
    mongo_1.default.connectDbByAccount(process.env.DB_HOST, parseInt(process.env.DB_PORT), process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS);
}
// redisClient
//   .connect()
//   .then(() => logger.info("Kết nối thành công với Redis"))
//   .catch((err) => {
//     logger.error("Kết nối tới Redis thất bại");
//     console.log(err);
//   });
// Khởi tạo socket
(0, new_ver_1.default)(server);
// Thiết lập chuyển hướng
app.use("/api", routes_1.default);
// Xử lý lỗi
app.use(error_handler_1.default);
// Chạy server
server.listen(8000, () => logger_1.default.info("Server đã được khởi tạo và đang lắng nghe ... "));

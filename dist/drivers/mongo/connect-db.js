"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDbByAccount = exports.connectDbByStringUrl = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../../utils/logger"));
function connectDbByStringUrl(connectionString) {
    mongoose_1.default
        .connect(connectionString)
        .then(() => logger_1.default.info("Kết nối thành công với MongoDb"))
        .catch((err) => {
        logger_1.default.error("Kết nối tới MongoDb thất bại");
        console.log(err);
    });
}
exports.connectDbByStringUrl = connectDbByStringUrl;
function connectDbByAccount(host, port, db, username, password) {
    mongoose_1.default
        // .connect(`mongodb://${host}:${port}/${db}`, {
        //   authSource: "admin",
        //   auth: { username, password },
        // })
        .connect(`mongodb://${host}:${port}/${db}`)
        .then(() => logger_1.default.info("Kết nối thành công với MongoDb"))
        .catch((err) => {
        logger_1.default.error("Kết nối tới MongoDb thất bại");
        console.log(err);
    });
}
exports.connectDbByAccount = connectDbByAccount;

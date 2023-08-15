"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("./logger"));
const FILENAME = path_1.default.join(__dirname, "../../../whitelist");
let whitelist = "*";
// Tìm kiếm whitelist file trả về danh sách client được chấp thuận kết nối
if (!fs_1.default.existsSync("FILENAME")) {
    logger_1.default.warn("Không tìm thấy whitelist. Trạng thái whitelist đã tắt");
}
else {
    logger_1.default.warn("Trạng thái whitelist đã được kích hoạt");
    whitelist = fs_1.default.readFileSync(FILENAME).toString("utf8").split("\n");
}
exports.default = whitelist;

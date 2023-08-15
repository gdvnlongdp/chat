import fs from "fs";
import path from "path";
import logger from "./logger";

const FILENAME = path.join(__dirname, "../../../whitelist");

let whitelist: string[] | "*" = "*";

// Tìm kiếm whitelist file trả về danh sách client được chấp thuận kết nối
if (!fs.existsSync("FILENAME")) {
  logger.warn("Không tìm thấy whitelist. Trạng thái whitelist đã tắt");
} else {
  logger.warn("Trạng thái whitelist đã được kích hoạt");
  whitelist = fs.readFileSync(FILENAME).toString("utf8").split("\n");
}

export default whitelist;

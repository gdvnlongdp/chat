import winston, { format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const FILENAME = "%DATE%.log";
const DIRNAME = "logs";

// Hiển thị log phía console
const consoleTransport = new winston.transports.Console({
  format: format.combine(format.colorize(), format.simple()),
});

// Ghi log vào file hằng ngày
const fileTransport = new DailyRotateFile({
  filename: FILENAME,
  dirname: DIRNAME,
});

const logger = winston.createLogger({
  level: "debug",
  transports: [consoleTransport, fileTransport],
});

export default logger;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
function errorHandler(err, _req, res, _next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Có gì đó sai sai";
    logger_1.default.error(err.name);
    res.status(statusCode).json({
        status: false,
        message,
    });
}
exports.default = errorHandler;

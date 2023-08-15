"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const regist_device_1 = __importDefault(require("../handlers/device_handlers/regist-device"));
const update_token_1 = __importDefault(require("../handlers/device_handlers/update-token"));
const verify_token_1 = __importDefault(require("../middlewares/verify-token"));
const deviceRouter = express_1.default.Router();
deviceRouter.post("/", verify_token_1.default, regist_device_1.default);
deviceRouter.patch("/", verify_token_1.default, update_token_1.default);
exports.default = deviceRouter;

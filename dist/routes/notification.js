"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const get_unread_noti_1 = __importDefault(require("../handlers/noti_handlers/get-unread-noti"));
const mark_as_read_1 = __importDefault(require("../handlers/noti_handlers/mark-as-read"));
const verify_token_1 = __importDefault(require("../middlewares/verify-token"));
const notiRouter = express_1.default.Router();
notiRouter.get("/", verify_token_1.default, get_unread_noti_1.default);
notiRouter.post("/mark-as-read/:id", verify_token_1.default, mark_as_read_1.default);
exports.default = notiRouter;

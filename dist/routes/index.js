"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const account_1 = __importDefault(require("./account"));
const auth_1 = __importDefault(require("./auth"));
const chat_1 = __importDefault(require("./chat"));
const device_1 = __importDefault(require("./device"));
const friend_1 = __importDefault(require("./friend"));
const group_1 = __importDefault(require("./group"));
const location_1 = __importDefault(require("./location"));
const notification_1 = __importDefault(require("./notification"));
const profile_1 = __importDefault(require("./profile"));
const relation_1 = __importDefault(require("./relation"));
const sticker_1 = __importDefault(require("./sticker"));
const api_version_1 = __importDefault(require("./api-version"));
const apiRouter = express_1.default.Router();
apiRouter.use("/auth", auth_1.default);
apiRouter.use("/accounts", account_1.default);
apiRouter.use("/profiles", profile_1.default);
apiRouter.use("/relations", relation_1.default);
apiRouter.use("/groups", group_1.default);
apiRouter.use("/chats", chat_1.default);
apiRouter.use("/friends", friend_1.default);
apiRouter.use("/notifications", notification_1.default);
apiRouter.use("/devices", device_1.default);
apiRouter.use("/location", location_1.default);
apiRouter.use("/stickers", sticker_1.default);
apiRouter.use("/api-version", api_version_1.default);
exports.default = apiRouter;
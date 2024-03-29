"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const get_my_profile_1 = __importDefault(require("../handlers/profile_handlers/get-my-profile"));
const get_profile_by_id_1 = __importDefault(require("../handlers/profile_handlers/get-profile-by-id"));
const get_profile_list_1 = __importDefault(require("../handlers/profile_handlers/get-profile-list"));
const update_profile_1 = __importDefault(require("../handlers/profile_handlers/update-profile"));
const upload_avatar_1 = __importDefault(require("../handlers/profile_handlers/upload-avatar"));
const upload_background_1 = __importDefault(require("../handlers/profile_handlers/upload-background"));
const verify_token_1 = __importDefault(require("../middlewares/verify-token"));
const uploader_1 = __importDefault(require("../utils/uploader"));
const update_profile_2 = __importDefault(require("../validations/profile/update-profile"));
const profileRouter = express_1.default.Router();
profileRouter.get("/my-profile", verify_token_1.default, get_my_profile_1.default);
profileRouter.get("/", get_profile_list_1.default);
profileRouter.get("/:id", get_profile_by_id_1.default);
profileRouter.patch("/", verify_token_1.default, (0, update_profile_2.default)(), update_profile_1.default);
profileRouter.patch("/avatar/upload", uploader_1.default.single("avatar"), verify_token_1.default, upload_avatar_1.default);
profileRouter.patch("/background/upload", uploader_1.default.single("background"), verify_token_1.default, upload_background_1.default);
exports.default = profileRouter;

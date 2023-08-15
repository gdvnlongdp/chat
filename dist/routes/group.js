"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const kick_user_1 = __importDefault(require("../handlers/chat_handlers/kick-user"));
const leave_group_1 = __importDefault(require("../handlers/chat_handlers/leave-group"));
const remove_admin_1 = __importDefault(require("../handlers/chat_handlers/remove-admin"));
const add_members_1 = __importDefault(require("../handlers/group_handlers/add-members"));
const change_avt_group_1 = __importDefault(require("../handlers/group_handlers/change-avt-group"));
const change_group_name_1 = __importDefault(require("../handlers/group_handlers/change-group-name"));
const create_group_1 = __importDefault(require("../handlers/group_handlers/create-group"));
const disgroup_1 = __importDefault(require("../handlers/group_handlers/disgroup"));
const get_group_by_id_1 = __importDefault(require("../handlers/group_handlers/get-group-by-id"));
const get_group_list_1 = __importDefault(require("../handlers/group_handlers/get-group-list"));
const verify_token_1 = __importDefault(require("../middlewares/verify-token"));
const uploader_1 = __importDefault(require("../utils/uploader"));
const change_group_name_2 = __importDefault(require("../validations/groups/change-group-name"));
const create_group_2 = __importDefault(require("../validations/groups/create-group"));
const groupRouter = express_1.default.Router();
groupRouter.get("/", verify_token_1.default, get_group_list_1.default);
groupRouter.get("/:id", verify_token_1.default, get_group_by_id_1.default);
groupRouter.post("/", verify_token_1.default, (0, create_group_2.default)(), create_group_1.default);
groupRouter.post("/members/add/:id", verify_token_1.default, add_members_1.default);
groupRouter.patch("/name/:groupId", verify_token_1.default, (0, change_group_name_2.default)(), change_group_name_1.default);
groupRouter.patch("/avatar/", uploader_1.default.single("avatar"), verify_token_1.default, change_avt_group_1.default);
groupRouter.patch("/kick-user/:conversationId", verify_token_1.default, kick_user_1.default);
groupRouter.patch("/disgroup/:conversationId", verify_token_1.default, disgroup_1.default);
groupRouter.patch("/leave-group/:conversationId", verify_token_1.default, leave_group_1.default);
groupRouter.patch("/remove-admin/:conversationId", [
    (0, express_validator_1.body)("userId")
        .notEmpty()
        .withMessage("Không tìm thấy userId"),
], verify_token_1.default, remove_admin_1.default);
exports.default = groupRouter;

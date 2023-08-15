"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const change_password_1 = __importDefault(require("../handlers/account_handlers/change-password"));
const get_account_by_email_1 = __importDefault(require("../handlers/account_handlers/get-account-by-email"));
const get_credentials_1 = __importDefault(require("../handlers/account_handlers/get-credentials"));
const verify_token_1 = __importDefault(require("../middlewares/verify-token"));
const change_password_2 = __importDefault(require("../validations/accounts/change-password"));
const accountRouter = express_1.default.Router();
accountRouter.get("/credentials", verify_token_1.default, get_credentials_1.default);
accountRouter.get("/users", verify_token_1.default, get_account_by_email_1.default);
accountRouter.patch("/password", verify_token_1.default, (0, change_password_2.default)(), change_password_1.default);
exports.default = accountRouter;

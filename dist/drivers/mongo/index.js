"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connect_db_1 = require("./connect-db");
const init_1 = __importDefault(require("./init"));
exports.default = { init: init_1.default, connectDbByAccount: connect_db_1.connectDbByAccount, connectDbByStringUrl: connect_db_1.connectDbByStringUrl };

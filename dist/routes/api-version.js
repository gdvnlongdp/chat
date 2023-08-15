"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const get_1 = require("../handlers/api_version_handlers/get");
const write_1 = require("../handlers/api_version_handlers/write");
const apiVersionRouter = (0, express_1.Router)();
apiVersionRouter.get("/", get_1.get);
apiVersionRouter.patch("/", write_1.write);
exports.default = apiVersionRouter;

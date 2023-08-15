"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({
    socket: {
        host: process.env.CACHE_HOST,
        port: parseInt(process.env.CACHE_PORT),
    },
});
exports.default = redisClient;

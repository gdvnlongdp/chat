"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_cron_1 = __importDefault(require("node-cron"));
const socket_io_1 = __importDefault(require("socket.io"));
const init_1 = require("../drivers/firebase/init");
const conversation_model_1 = __importDefault(require("../models/conversation-model"));
const device_info_model_1 = __importDefault(require("../models/device-info-model"));
const location_1 = __importDefault(require("../models/location"));
const message_model_1 = __importDefault(require("../models/message-model"));
const reaction_model_1 = __importDefault(require("../models/reaction-model"));
const user_model_1 = __importDefault(require("../models/user-model"));
const logger_1 = __importDefault(require("../utils/logger"));
const _ = require("lodash");
function requestLocation() {
    return __awaiter(this, void 0, void 0, function* () {
        const users = yield user_model_1.default.find({
            requireLocation: true,
        });
        const tokens = yield Promise.all(users.map((user) => __awaiter(this, void 0, void 0, function* () {
            const locate = yield location_1.default.findOne({
                userId: user.id,
            })
                .sort({ _id: -1 })
                .limit(1);
            // Check thời gian
            const pivot = new Date(Date.now() - 30 * 60 * 1000);
            if ((locate === null || locate === void 0 ? void 0 : locate.createdAt) < pivot) {
                return yield tokenByUserId[user.id];
            }
            return undefined;
        })) || []);
        if (tokens.filter((el) => el).length) {
            yield (init_1.firebaseAdmin === null || init_1.firebaseAdmin === void 0 ? void 0 : init_1.firebaseAdmin.messaging().sendMulticast({
                notification: {
                    title: "Đã lâu rồi bạn không bật định vị",
                    body: "Hãy vào ứng dụng và bật định vị trong giờ hành chính nhá!",
                },
                data: {
                    requireLocation: "true",
                },
                tokens: tokens.filter((el) => el),
            }));
        }
    });
}
// Chạy công việc mỗi 30 phút trong khoảng từ 8h đến 12h vào mỗi ngày
node_cron_1.default.schedule("*/30 1-5 * * *", requestLocation);
// Chạy công việc mỗi 30 phút trong khoảng từ 13h15 đến 17h15 vào mỗi ngày
node_cron_1.default.schedule("15,45 6-9 * * *", requestLocation);
const countUpdates = new Map();
const addFriendUpdates = new Map();
let webByUserId = {};
let mobileByUserId = {};
let tokenByUserId = {};
function createSocket(app) {
    const io = new socket_io_1.default.Server(app, {
        cors: { origin: "*" },
    });
    logger_1.default.info("Socket đã được khởi tạo");
    io.on("connection", (socket) => {
        try {
            socket.on("new_connect", (data) => __awaiter(this, void 0, void 0, function* () {
                if (!data) {
                    return;
                }
                const { accessToken } = data;
                if (!accessToken) {
                }
                else {
                    try {
                        socket.user = jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
                    }
                    catch (err) {
                        console.log(err);
                        socket.emit("require_logout");
                    }
                }
            }));
            socket.on("device", (data) => __awaiter(this, void 0, void 0, function* () {
                if (!socket.user) {
                    return;
                }
                const { token, platform: plat } = data;
                console.log("Nhận sự kiện device:", socket.id, data);
                socket.platform = plat;
                socket.fcmtkn = token;
                yield user_model_1.default.findByIdAndUpdate(socket.user.id, {
                    $set: {
                        online: true,
                    },
                });
                io.emit("user_online", socket.user.id);
                if (plat === "Web") {
                    const socketId = webByUserId[socket.user.id];
                    if (socketId !== socket.id) {
                        const targetWs = io.sockets.sockets.get(socketId);
                        if (targetWs) {
                            console.log("Yêu cầu logout trên nền tảng web:", targetWs.id);
                            targetWs.leave(socket.user.id);
                            socket.to(targetWs.id).emit("require_logout");
                        }
                        webByUserId[socket.user.id] = socket.id;
                    }
                    socket.join(socket.user.id);
                }
                else {
                    const device = yield device_info_model_1.default.findOne({
                        userId: socket.user.id,
                    });
                    if (token && (device === null || device === void 0 ? void 0 : device.token) === token) {
                        const socketId = mobileByUserId[socket.user.id];
                        if (socketId !== socket.id) {
                            const targetWs = io.sockets.sockets.get(socketId);
                            if (targetWs) {
                                console.log("Yêu cầu logout trên nền tảng mobile:", targetWs.id);
                                targetWs.leave(socket.user.id);
                                socket.to(targetWs.id).emit("require_logout");
                            }
                        }
                        mobileByUserId[socket.user.id] = socket.id;
                        tokenByUserId[socket.user.id] = token;
                        socket.join(socket.user.id);
                    }
                    else {
                        socket.emit("require_logout");
                    }
                }
                console.log("webByUserId:", webByUserId);
                console.log("mobileByUserId:", mobileByUserId);
                console.log("tokenByUserId", tokenByUserId);
            }));
            // Location
            socket.on("share_location", (data) => {
                const { longitude, latitude, ip, mac, token } = data;
                console.log("share_location:::", data);
                // Tiến hành lưu tọa độ
                if (socket.user) {
                    const newLocate = new location_1.default({
                        userId: socket.user.id,
                        longitude,
                        latitude,
                        ip,
                        mac,
                        token,
                    });
                    newLocate.save();
                }
            });
            // thu hồi react
            socket.on("unReact", (data) => __awaiter(this, void 0, void 0, function* () {
                const { conversationId, messageId, user: { id: userId }, } = data;
                const reaction = yield reaction_model_1.default.findOneAndUpdate({
                    messageId,
                    user: userId,
                }, {
                    [`reacts.angry`]: 0,
                    [`reacts.cry`]: 0,
                    [`reacts.dislike`]: 0,
                    [`reacts.haha`]: 0,
                    [`reacts.like`]: 0,
                    [`reacts.love`]: 0,
                    [`reacts.sad`]: 0,
                    [`reacts.wow`]: 0,
                }, { upsert: true, new: true });
                if (!reaction) {
                    socket.to(conversationId).emit("react", null);
                }
                const msg = yield message_model_1.default.findById(messageId);
                yield (msg === null || msg === void 0 ? void 0 : msg.save());
                if (!(msg === null || msg === void 0 ? void 0 : msg.reaction.includes(reaction.id))) {
                    yield (msg === null || msg === void 0 ? void 0 : msg.updateOne({
                        $addToSet: { reaction: reaction.id },
                    }));
                    yield (msg === null || msg === void 0 ? void 0 : msg.save());
                }
                yield message_model_1.default.findById(msg === null || msg === void 0 ? void 0 : msg.id).populate({
                    path: "reaction",
                    populate: {
                        path: "user",
                        populate: {
                            path: "profile",
                        },
                    },
                });
                socket.to(conversationId).emit("unReact", data);
            }));
            // React
            socket.on("react", (data) => {
                const { icon, messageId, conversationId, user: { id: userId }, } = data;
                // Gửi sự kiện trả lại conversation
                socket.to(conversationId).emit("react", data);
                console.log("react:", data);
                if (userId) {
                    //
                    if (countUpdates.has(`${messageId}_${icon}_${userId}`)) {
                        const debouncedFn = countUpdates.get(`${messageId}_${icon}_${userId}`);
                        debouncedFn(data);
                    }
                    else {
                        const debouncedFn = _.debounce((data) => __awaiter(this, void 0, void 0, function* () {
                            const { messageId, user: { id: userId }, count, icon, } = data;
                            // Tiến hành cập nhật mongodb
                            try {
                                const reaction = yield reaction_model_1.default.findOneAndUpdate({
                                    messageId,
                                    user: userId,
                                }, {
                                    [`reacts.${icon}`]: count,
                                }, { upsert: true, new: true });
                                if (!reaction) {
                                    socket.to(conversationId).emit("react", null);
                                }
                                const msg = yield message_model_1.default.findById(messageId);
                                yield (msg === null || msg === void 0 ? void 0 : msg.save());
                                if (!(msg === null || msg === void 0 ? void 0 : msg.reaction.includes(reaction.id))) {
                                    yield (msg === null || msg === void 0 ? void 0 : msg.updateOne({
                                        $addToSet: { reaction: reaction.id },
                                    }));
                                    yield (msg === null || msg === void 0 ? void 0 : msg.save());
                                }
                                yield message_model_1.default.findById(msg === null || msg === void 0 ? void 0 : msg.id).populate({
                                    path: "reaction",
                                    populate: {
                                        path: "user",
                                        populate: {
                                            path: "profile",
                                        },
                                    },
                                });
                                socket.to(conversationId).emit("react", data);
                            }
                            catch (err) {
                                console.log(err);
                                socket.to(conversationId).emit("react", data);
                            }
                            // Sau khi lưu thành công, xóa hàm debounce của msgId này khỏi Map
                            countUpdates.delete(`${messageId}_${icon}_${userId}`);
                        }), 1000); // Trì hoãn 1 giây trước khi lưu vào database
                        // Lưu hàm debounce mới vào Map cho msgId này
                        countUpdates.set(`${messageId}_${icon}_${userId}`, debouncedFn);
                        // Gọi hàm debounce mới để lưu message vào database
                        debouncedFn(data);
                    }
                }
            });
            socket.on("join_room", (conversationId) => {
                socket.join(conversationId);
            });
            socket.on("sign_token", (token) => {
                if (socket.user) {
                    tokenByUserId[socket.user.id] = token;
                }
            });
            socket.on("send_message", (data) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (socket.user) {
                    socket.broadcast
                        .to(data.conversation)
                        .emit("someone_sent_message", data);
                    io.to(data.conversation).emit("notification", {
                        type: "new_message",
                        data,
                    });
                    // Lấy danh sách token theo thành viên trong hộp thoại
                    const conversation = yield conversation_model_1.default.findById(data.conversation).populate({
                        path: "lastMessage",
                        populate: {
                            path: "sender",
                            populate: "profile",
                        },
                    });
                    const tokens = conversation === null || conversation === void 0 ? void 0 : conversation.members.filter((el) => el.toString() !== socket.user.id).map((m) => {
                        return tokenByUserId[m];
                    }).filter((el) => el);
                    try {
                        // Gửi thông báo
                        if (tokens && tokens.length > 0) {
                            // Xử lý hiển thị tin nhắn có tag
                            const regex = /@\[\_\_(\w+)\_\_\]\(\_\_(.+?)\_\_\)/g;
                            const msg = (_a = conversation === null || conversation === void 0 ? void 0 : conversation.lastMessage) === null || _a === void 0 ? void 0 : _a.content;
                            let formattedString = msg.replace(regex, (match, p1, p2) => {
                                const name = p2;
                                return `@${name}`;
                            });
                            formattedString =
                                formattedString.substring(0, 50) +
                                    (formattedString.length > 50 ? "..." : "");
                            const tagTokens = (data === null || data === void 0 ? void 0 : data.tags)
                                .filter((el) => el.toString() !== socket.user.id)
                                .map((m) => {
                                return tokenByUserId[m];
                            })
                                .filter((el) => el);
                            tokens.forEach((t) => __awaiter(this, void 0, void 0, function* () {
                                var _b, _c, _d, _e, _f, _g;
                                console.log("Firebase Token:::", t);
                                yield (init_1.firebaseAdmin === null || init_1.firebaseAdmin === void 0 ? void 0 : init_1.firebaseAdmin.messaging().send({
                                    notification: {
                                        title: `${(conversation === null || conversation === void 0 ? void 0 : conversation.type) === "group"
                                            ? conversation.name + ": "
                                            : ""}Có tin nhắn mới từ ${(_d = (_c = (_b = conversation === null || conversation === void 0 ? void 0 : conversation.lastMessage) === null || _b === void 0 ? void 0 : _b.sender) === null || _c === void 0 ? void 0 : _c.profile) === null || _d === void 0 ? void 0 : _d.name}`,
                                        body: !(conversation === null || conversation === void 0 ? void 0 : conversation.lastMessage).isSticker
                                            ? tagTokens.includes(t)
                                                ? "Đã tag bạn vào một tin nhắn"
                                                : `${(conversation === null || conversation === void 0 ? void 0 : conversation.lastMessage).attachment
                                                    ? "Đã gửi một tập tin"
                                                    : formattedString}`
                                            : "Đã gửi một nhãn dán",
                                    },
                                    data: {
                                        conversationId: conversation === null || conversation === void 0 ? void 0 : conversation.id,
                                        title: `${(conversation === null || conversation === void 0 ? void 0 : conversation.type) === "group"
                                            ? conversation.name + ": "
                                            : ""}Có tin nhắn mới từ ${(_g = (_f = (_e = conversation === null || conversation === void 0 ? void 0 : conversation.lastMessage) === null || _e === void 0 ? void 0 : _e.sender) === null || _f === void 0 ? void 0 : _f.profile) === null || _g === void 0 ? void 0 : _g.name}`,
                                        body: !(conversation === null || conversation === void 0 ? void 0 : conversation.lastMessage).isSticker
                                            ? tagTokens.includes(t)
                                                ? "Đã tag bạn vào một tin nhắn"
                                                : `${(conversation === null || conversation === void 0 ? void 0 : conversation.lastMessage).attachment
                                                    ? "Đã gửi một tập tin"
                                                    : formattedString}`
                                            : "Đã gửi một nhãn dán",
                                    },
                                    token: t,
                                }));
                            }));
                        }
                    }
                    catch (error) {
                        console.log("Lỗi kết nối firebase");
                        console.log(error);
                        (0, init_1.initializeFirebaseAdmin)();
                    }
                }
            }));
            socket.on("add_friend_request", (data) => __awaiter(this, void 0, void 0, function* () {
                const { from: { id: userFromId, profile: { name }, }, to: { id: userId }, } = data;
                try {
                    if (userFromId) {
                        if (addFriendUpdates.has(`${userFromId}_${userId}`)) {
                            const debouncedFn = addFriendUpdates.get(`${userFromId}_${userId}`);
                            debouncedFn(data);
                        }
                        else {
                            const debouncedFn = _.debounce((data) => __awaiter(this, void 0, void 0, function* () {
                                // Firebase gửi thông báo có người kết bạn
                                if (tokenByUserId[userId]) {
                                    yield (init_1.firebaseAdmin === null || init_1.firebaseAdmin === void 0 ? void 0 : init_1.firebaseAdmin.messaging().sendMulticast({
                                        notification: {
                                            title: "Lời mời kết bạn",
                                            body: `Bạn có mời lời kết bạn từ ${name}`,
                                        },
                                        data: {
                                            title: "Lời mời kết bạn",
                                            body: `Bạn có mời lời kết bạn từ ${name}`,
                                        },
                                        tokens: [tokenByUserId[userId]],
                                    }));
                                }
                                // Sau thông báo thành công, xóa hàm debounce của msgId này khỏi Map
                                addFriendUpdates.delete(`${userFromId}_${userId}`);
                            }), 3000); // Trì hoãn 3 giây
                            // Lưu hàm debounce mới vào Map
                            addFriendUpdates.set(`${userFromId}_${userId}`, debouncedFn);
                            debouncedFn(data);
                        }
                    }
                }
                catch (error) {
                    console.log("Lỗi kết nối firebase");
                    console.log(error);
                    (0, init_1.initializeFirebaseAdmin)();
                }
                socket.to(userId).emit("has_request", data);
            }));
            socket.on("disgroup", (data) => {
                const { conversationId } = data;
                socket.to(conversationId).emit("disgroup", conversationId);
            });
            socket.on("change_avt_group", (data) => {
                const { groupId } = data;
                socket.to(groupId).emit("change_avt_group", data);
            });
            socket.on("change_name_group", (data) => {
                const { groupId } = data;
                socket.to(groupId).emit("change_name_group", data);
            });
            socket.on("new_members", (data) => __awaiter(this, void 0, void 0, function* () {
                const { conversation } = data;
                const tmp = conversation.members.map((el) => el.id);
                function fetchMembers(users) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return yield user_model_1.default.find({ _id: users }).populate("profile");
                    });
                }
                socket.broadcast
                    .to(data.members)
                    .to(tmp)
                    .emit("new_members", Object.assign(Object.assign({}, data), { user: yield fetchMembers(data.members) }));
            }));
            socket.on("accept", (data) => __awaiter(this, void 0, void 0, function* () {
                const { userId, conversationId } = data;
                // Join room trên sv
                socket.join(conversationId);
                const targetSocket = io.sockets.sockets.get(socket.user.id);
                if (targetSocket) {
                    targetSocket.join(conversationId);
                }
                function callReq(id) {
                    return __awaiter(this, void 0, void 0, function* () {
                        // Lấy danh sách hộp thoại mà người dùng là thành viên trong đó
                        const conver = yield conversation_model_1.default.findById(id)
                            .populate({
                            path: "lastMessage",
                            populate: {
                                path: "attachment",
                            },
                        })
                            .populate({
                            path: "lastMessage",
                            populate: [
                                {
                                    path: "reaction",
                                    populate: {
                                        path: "user",
                                        populate: {
                                            path: "profile",
                                        },
                                    },
                                },
                                {
                                    path: "sender",
                                    populate: {
                                        path: "profile",
                                    },
                                },
                                {
                                    path: "reply",
                                    populate: [
                                        {
                                            path: "reaction",
                                            populate: {
                                                path: "user",
                                                populate: {
                                                    path: "profile",
                                                },
                                            },
                                        },
                                        {
                                            path: "sender",
                                            populate: {
                                                path: "profile",
                                            },
                                        },
                                        {
                                            path: "attachment",
                                        },
                                    ],
                                },
                            ],
                        })
                            .populate({
                            path: "members",
                            populate: {
                                path: "profile",
                            },
                        })
                            .populate({
                            path: "conversationReadByUser",
                        });
                        if (!conver) {
                            return null;
                        }
                        const val = conver.conversationReadByUser.find((item) => item.userId.toString() === userId.toString());
                        return Object.assign(Object.assign({}, conver.toJSON()), { unreadCount: val ? val["__v"] : 1 });
                    });
                }
                socket
                    .to(userId)
                    .to(conversationId)
                    .emit("someone_accept_request", Object.assign(Object.assign({}, data), { conversation: yield callReq(conversationId), friend: yield user_model_1.default.findById(socket.user.id).populate("profile") }));
            }));
            // từ chối kết bạn
            socket.on("reject", (data) => {
                const { userId } = data;
                if (socket.user) {
                    socket.to(userId).emit("reject", socket.user.id);
                }
            });
            socket.on("delete_friend", (data) => {
                const { friendId } = data;
                if (socket.user) {
                    socket.to(friendId).emit("delete_friend", socket.user.id);
                }
            });
            socket.on("unsend_message", (data) => {
                const { conversationId } = data;
                socket.to(conversationId).emit("unsend_message", data);
            });
            socket.on("leave_group", (data) => {
                const { conversationId } = data;
                socket.broadcast.to(conversationId).emit("leave_group", data);
                socket.leave(conversationId);
            });
            socket.on("kick_user", (data) => {
                const { conversationId, userId } = data;
                socket.broadcast.to(conversationId).emit("kick_user", data);
                socket.to(userId).emit("leave_group", data);
            });
            socket.on("grant_creator", (data) => {
                const { conversationId } = data;
                socket.broadcast.to(conversationId).emit("grant_creator", data);
            });
            socket.on("grant_admins", (data) => {
                const { conversationId } = data;
                socket.broadcast.to(conversationId).emit("grant_admins", data);
            });
            socket.on("remove_admin", (data) => {
                const { conversationId } = data;
                socket.to(conversationId).emit("remove_admin", data);
            });
        }
        catch (err) {
            console.log(err);
        }
        // Sự kiện có thành viên mới trong nhóm (create group, add members)
        socket.on("new_group", (data) => {
            // Join room tren sv
            socket.join(data.id);
            const { members } = data;
            members.map((el) => {
                socket.to(el.id).emit("new_group", data);
            });
        });
        socket.on("logout", () => __awaiter(this, void 0, void 0, function* () {
            if (!socket.user) {
                return;
            }
            console.log("Nhan su kien logout get socket", socket.user.id, socket.id, webByUserId[socket.user.id], mobileByUserId[socket.user.id]);
            if (socket.platform === "Web" &&
                webByUserId[socket.user.id] === socket.id) {
                delete webByUserId[socket.user.id];
            }
            if (socket.platform !== "Web" &&
                mobileByUserId[socket.user.id] === socket.id) {
                console.log("ahihi:", socket.user.id, mobileByUserId);
                delete mobileByUserId[socket.user.id];
                delete tokenByUserId[socket.user.id];
            }
            // Cập nhật trạng thái online của người dùng khi cả 2 thiết bị đều không còn id
            if (!webByUserId[socket.user.id] &&
                !mobileByUserId[socket.user.id]) {
                io.emit("user_offline", socket.user.id);
                yield user_model_1.default.findByIdAndUpdate(socket.user.id, { online: false });
            }
            socket.disconnect(true);
        }));
        socket.on("disconnect", () => __awaiter(this, void 0, void 0, function* () {
            if (!socket.user) {
                return;
            }
            console.log("Một người dùng ngắt kết nối", socket.id);
            if (socket.platform === "Web" &&
                webByUserId[socket.user.id] === socket.id) {
                delete webByUserId[socket.user.id];
            }
            if (socket.platform !== "Web" &&
                mobileByUserId[socket.user.id] === socket.id) {
                delete mobileByUserId[socket.user.id];
            }
            // Cập nhật trạng thái online của người dùng khi cả 2 thiết bị đều không còn id
            if (!webByUserId[socket.user.id] &&
                !mobileByUserId[socket.user.id]) {
                io.emit("user_offline", socket.user.id);
                yield user_model_1.default.findByIdAndUpdate(socket.user.id, { online: false });
            }
        }));
    });
}
exports.default = createSocket;

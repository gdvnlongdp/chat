import express from "express";
import getUnreadNoti from "../handlers/noti_handlers/get-unread-noti";
import markAsRead from "../handlers/noti_handlers/mark-as-read";
import verifyToken from "../middlewares/verify-token";

const notiRouter = express.Router();

notiRouter.get("/", verifyToken, getUnreadNoti);

notiRouter.post("/mark-as-read/:id", verifyToken, markAsRead);

export default notiRouter;

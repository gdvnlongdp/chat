import express from "express";
import accept from "../handlers/friend_handlers/accept";
import addFriend from "../handlers/friend_handlers/add-friend";
import cancelRequest from "../handlers/friend_handlers/cancel-request";
import getFriendList from "../handlers/friend_handlers/get-friend-list";
import getRequestList from "../handlers/friend_handlers/get-request-list";
import rejectRequest from "../handlers/friend_handlers/reject-request";
import unfriend from "../handlers/friend_handlers/unfriend";
import verifyToken from "../middlewares/verify-token";

const friendRouter = express.Router();

friendRouter.get("/", verifyToken, getFriendList);

friendRouter.get("/requests", verifyToken, getRequestList);
// friendRouter.get("/requests", verifyToken, getRequestedList);

friendRouter.post("/add", verifyToken, addFriend);

friendRouter.post("/accept", verifyToken, accept);
friendRouter.post("/reject", verifyToken, rejectRequest);
friendRouter.post("/cancel", verifyToken, cancelRequest);
friendRouter.delete("/unfriend", verifyToken, unfriend);

export default friendRouter;

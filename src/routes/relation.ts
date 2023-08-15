import express from "express";
import addFriend from "../handlers/relations/add-friend";
import blockUser from "../handlers/relations/block-user";
import getFriendList from "../handlers/relations/get-friend-list";
import unblock from "../handlers/relations/unblock";
import unfriend from "../handlers/relations/unfriend";
import verifyToken from "../middlewares/verify-token";
import validateAddFriend from "../validations/relations/add-friend";
import validateBlockUser from "../validations/relations/block-user";
import validateUnblock from "../validations/relations/unblock";
import validateUnfriend from "../validations/relations/unfriend";

const relationRouter = express.Router();

relationRouter.get("/friends/list", verifyToken, getFriendList);
relationRouter.post(
  "/friends/add",
  verifyToken,
  validateAddFriend(),
  addFriend
);
relationRouter.post(
  "/friends/unfriend",
  verifyToken,
  validateUnfriend(),
  unfriend
);
relationRouter.post(
  "/users/block",
  verifyToken,
  validateBlockUser(),
  blockUser
);
relationRouter.post("/users/unblock", verifyToken, validateUnblock(), unblock);

export default relationRouter;

import express from "express";
import { body } from "express-validator";
import kickUser from "../handlers/chat_handlers/kick-user";
import leaveGroup from "../handlers/chat_handlers/leave-group";
import removeAdmin from "../handlers/chat_handlers/remove-admin";
import addMember from "../handlers/group_handlers/add-members";
import changeAvtGroup from "../handlers/group_handlers/change-avt-group";
import changeGroupName from "../handlers/group_handlers/change-group-name";
import createGroup from "../handlers/group_handlers/create-group";
import disGroup from "../handlers/group_handlers/disgroup";
import getGroupById from "../handlers/group_handlers/get-group-by-id";
import getGroupList from "../handlers/group_handlers/get-group-list";
import verifyToken from "../middlewares/verify-token";
import uploader from "../utils/uploader";
import validateChangeGroupName from "../validations/groups/change-group-name";
import validateCreateGroup from "../validations/groups/create-group";

const groupRouter = express.Router();

groupRouter.get("/", verifyToken, getGroupList);
groupRouter.get("/:id", verifyToken, getGroupById);
groupRouter.post(
  "/",
  verifyToken,
  validateCreateGroup(),
  createGroup
);
groupRouter.post(
  "/members/add/:id",
  verifyToken,
  addMember
);
groupRouter.patch(
  "/name/:groupId",
  verifyToken,
  validateChangeGroupName(),
  changeGroupName
);
groupRouter.patch(
  "/avatar/",
  uploader.single("avatar"),
  verifyToken,
  changeAvtGroup
);

groupRouter.patch(
  "/kick-user/:conversationId",
  verifyToken,
  kickUser
);

groupRouter.patch(
  "/disgroup/:conversationId",
  verifyToken,
  disGroup
);

groupRouter.patch(
  "/leave-group/:conversationId",
  verifyToken,
  leaveGroup
);

groupRouter.patch(
  "/remove-admin/:conversationId",
  [
    body("userId")
      .notEmpty()
      .withMessage("Không tìm thấy userId"),
  ],
  verifyToken,
  removeAdmin
);

export default groupRouter;

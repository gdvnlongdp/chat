import express from "express";
import getMyProfile from "../handlers/profile_handlers/get-my-profile";
import getProfileById from "../handlers/profile_handlers/get-profile-by-id";
import getProfileList from "../handlers/profile_handlers/get-profile-list";
import updateProfile from "../handlers/profile_handlers/update-profile";
import uploadAvatar from "../handlers/profile_handlers/upload-avatar";
import uploadBackground from "../handlers/profile_handlers/upload-background";
import verifyToken from "../middlewares/verify-token";
import uploader from "../utils/uploader";
import validateUpdateProfile from "../validations/profile/update-profile";

const profileRouter = express.Router();

profileRouter.get("/my-profile", verifyToken, getMyProfile);
profileRouter.get("/", getProfileList);
profileRouter.get("/:id", getProfileById);

profileRouter.patch("/", verifyToken, validateUpdateProfile(), updateProfile);

profileRouter.patch(
  "/avatar/upload",
  uploader.single("avatar"),
  verifyToken,
  uploadAvatar
);

profileRouter.patch(
  "/background/upload",
  uploader.single("background"),
  verifyToken,
  uploadBackground
);

export default profileRouter;

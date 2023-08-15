import express from "express";
import regisDevice from "../handlers/device_handlers/regist-device";
import updateToken from "../handlers/device_handlers/update-token";
import verifyToken from "../middlewares/verify-token";

const deviceRouter = express.Router();

deviceRouter.post("/", verifyToken, regisDevice);
deviceRouter.patch("/", verifyToken, updateToken);

export default deviceRouter;

import express from "express";
import accountRouter from "./account";
import authRouter from "./auth";
import chatRouter from "./chat";
import deviceRouter from "./device";
import friendRouter from "./friend";
import groupRouter from "./group";
import locationRouter from "./location";
import notiRouter from "./notification";
import profileRouter from "./profile";
import relationRouter from "./relation";
import stickerRouter from "./sticker";
import apiVersionRouter from "./api-version";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/accounts", accountRouter);
apiRouter.use("/profiles", profileRouter);
apiRouter.use("/relations", relationRouter);
apiRouter.use("/groups", groupRouter);
apiRouter.use("/chats", chatRouter);
apiRouter.use("/friends", friendRouter);
apiRouter.use("/notifications", notiRouter);
apiRouter.use("/devices", deviceRouter);
apiRouter.use("/location", locationRouter);
apiRouter.use("/stickers", stickerRouter);
apiRouter.use("/api-version", apiVersionRouter);

export default apiRouter;

import { Router } from "express";
import { get } from "../handlers/api_version_handlers/get";
import { write } from "../handlers/api_version_handlers/write";

const apiVersionRouter = Router();

apiVersionRouter.get("/", get);
apiVersionRouter.patch("/", write);

export default apiVersionRouter;

import { Router } from "express";
import getLocates from "../handlers/location_handlers/get-locates";
import createLocate from "../handlers/location_handlers/new-location";
import verifyToken from "../middlewares/verify-token";
import getLocatesByUsername from "../handlers/location_handlers/get-locates-by-username";
import check from "../handlers/location_handlers/check";
import getLocatesByGroup from "../handlers/location_handlers/get-locates-by-group";
import getLocatesFilter from "../handlers/location_handlers/get-locates-filter";

const locationRouter = Router();

locationRouter.post("/check", check);

locationRouter.post("/filter/:groupId", getLocatesFilter);

locationRouter.post("/location-by-group/:groupId", getLocatesByGroup);

locationRouter.post("/trace/:username", getLocatesByUsername);

locationRouter.post("/:userId", verifyToken, getLocates);

locationRouter.post("/", verifyToken, createLocate);

export default locationRouter;

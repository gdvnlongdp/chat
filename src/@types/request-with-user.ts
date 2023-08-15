import { Request } from "express";
import JwtPayload from "./jwt-payload";

type RequestWithUser = Request & {
  user?: JwtPayload;
};

export default RequestWithUser;

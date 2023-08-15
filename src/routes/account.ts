import express from "express";
import changePassword from "../handlers/account_handlers/change-password";
import getAccountByEmail from "../handlers/account_handlers/get-account-by-email";
import getCredentials from "../handlers/account_handlers/get-credentials";
import verifyToken from "../middlewares/verify-token";
import validateChangePassword from "../validations/accounts/change-password";

const accountRouter = express.Router();

accountRouter.get("/credentials", verifyToken, getCredentials);
accountRouter.get("/users", verifyToken, getAccountByEmail);
accountRouter.patch(
  "/password",
  verifyToken,
  validateChangePassword(),
  changePassword
);

export default accountRouter;

import express from "express";
import login from "../handlers/auth_handlers/login";
import refreshTokenHandler from "../handlers/auth_handlers/refresh-token";
import register from "../handlers/auth_handlers/register";
import resetPassword from "../handlers/auth_handlers/reset-password";
import sendOtpRegister from "../handlers/auth_handlers/send-otp-register";
import sendOtpResetPassword from "../handlers/auth_handlers/send-otp-reset-password";
import validateLogin from "../validations/auth/login";
import validateRefreshToken from "../validations/auth/refresh-token";
import validateRegister from "../validations/auth/register";
import validateResetPassword from "../validations/auth/reset-password";
import validateSendOtpRegister from "../validations/auth/send-otp-register";
import validateSendOtpResetPassword from "../validations/auth/send-otp-reset-password";

const authRouter = express.Router();

authRouter.post("/login", validateLogin(), login);
authRouter.post("/register", validateRegister(), register);
authRouter.post("/refresh-token", validateRefreshToken(), refreshTokenHandler);
authRouter.post(
  "/register/otp/send",
  validateSendOtpRegister(),
  sendOtpRegister
);
authRouter.post(
  "/password/otp/send",
  validateSendOtpResetPassword(),
  sendOtpResetPassword
);
authRouter.post("/password/reset", validateResetPassword(), resetPassword);

export default authRouter;

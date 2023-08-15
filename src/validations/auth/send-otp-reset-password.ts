import { check } from "express-validator";

function validateSendOtpResetPassword() {
  return [
    check("email")
      .notEmpty()
      .withMessage("Yêu cầu email tài khoản")
      .isEmail()
      .withMessage("Email tài khoản không đúng định dạng"),
  ];
}

export default validateSendOtpResetPassword;

import { check } from "express-validator";

function validateRefreshToken() {
  return [check("refreshToken").notEmpty().withMessage("Yêu cầu refreshToken")];
}

export default validateRefreshToken;

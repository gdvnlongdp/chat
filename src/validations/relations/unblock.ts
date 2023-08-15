import { check } from "express-validator";

function validateUnblock() {
  return [
    check("userId")
      .notEmpty()
      .withMessage("Yêu cầu id của người dùng cần bỏ chặn"),
  ];
}

export default validateUnblock;

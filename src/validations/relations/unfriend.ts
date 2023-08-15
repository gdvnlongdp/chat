import { check } from "express-validator";

function validateUnfriend() {
  return [
    check("userId")
      .notEmpty()
      .withMessage("Yêu cầu id của người dùng cần hủy kết bạn"),
  ];
}

export default validateUnfriend;

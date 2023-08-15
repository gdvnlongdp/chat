import { check } from "express-validator";

function validateAddMember() {
  return [
    check("userId")
      .notEmpty()
      .withMessage("Yêu cầu id của người dùng để thêm vào nhóm"),
  ];
}

export default validateAddMember;

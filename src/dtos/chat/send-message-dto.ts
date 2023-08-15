import { Types } from "mongoose";

type SendMessageDto = {
  content?: string;
  resourceType?: string;
  repId?: Types.ObjectId;
  tags?: string[];
  isSticker: boolean;
};

export default SendMessageDto;

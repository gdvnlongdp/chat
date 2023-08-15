import { v2 as cloudinary } from "cloudinary";
import logger from "../../utils/logger";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
  secure: true,
});

// Kiểm tra kết nối
cloudinary.api
  .ping()
  .then((res) =>
    logger.info(`Trạng thái kết nối với cloudinary: ${res.status}`)
  )
  .catch((err) => {
    logger.error("Kết nối với cloudinary thất bại");
    console.log(err);
  });

export default cloudinary;

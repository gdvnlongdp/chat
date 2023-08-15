import multer from "multer";

const uploader = multer({
  // storage: multer.memoryStorage(),
  storage: multer.diskStorage({
    destination(req, file, callback) {
      callback(null, "uploads");
    },
    filename(req, file, callback) {
      file.originalname = Buffer.from(
        file.originalname,
        "latin1"
      ).toString("utf8");
      callback(null, `${Date.now()}-${file.originalname}`);
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // Giới hạn kích thước file là 100Mb
  },
});

export default uploader;

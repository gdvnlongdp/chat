interface IAttachment {
  filename: string;
  url: string;
  size: number;
  type: "image" | "video" | "raw";
}

export default IAttachment;

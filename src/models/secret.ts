import mongoose from "mongoose";

const schema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
  },
});

const Secret = mongoose.model("secret", schema);
export { Secret };

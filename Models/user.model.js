const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    dob: { type: String, required: true },
    photo: { type: String, required: true },
    cv: { type: String, required: true },
    status: { type: String, required: true },
  },
  {
    versionKey: false,
  }
);

const userModel = mongoose.model("User", UserSchema);

module.exports = { userModel };

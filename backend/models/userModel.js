const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
    },
    boards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Board" }],
    securityQ: {
      type: String,
      required: [true, "Please add a security question"],
    },
    securityA: {
      type: String,
      required: [true, "Please add an answer"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);

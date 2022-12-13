const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
  // Email of user not having an account
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // Invited boards
  invitedboards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Board" }],
});

module.exports = mongoose.model("Invite", inviteSchema);

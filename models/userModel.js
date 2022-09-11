const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },

    addedCards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Card" }],
    assignedCards: [{ type: mongoose.Schema.Types.ObjectId, ref: "Card" }],
  },

  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;

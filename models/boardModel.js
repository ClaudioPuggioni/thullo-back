const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    desc: {
      type: String,
    },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lists: [{ type: mongoose.Schema.Types.ObjectId, ref: "List" }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    active: {
      type: Boolean,
      default: true,
    },
  },

  { timestamps: true }
);

const BoardModel = mongoose.model("Board", boardSchema);

module.exports = BoardModel;

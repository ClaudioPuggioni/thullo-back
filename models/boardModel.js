const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    lists: [{ type: mongoose.Schema.Types.ObjectId, ref: "List" }],
    active: {
      type: Boolean,
      default: true,
    },
  },

  { timestamps: true }
);

const BoardModel = mongoose.model("Board", boardSchema);

module.exports = BoardModel;

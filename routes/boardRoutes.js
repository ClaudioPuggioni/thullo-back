const express = require("express");
const router = express.Router();
const BoardModel = require("../models/boardModel");
const ListModel = require("../models/listModel");
const multer = require("multer");
const UserModel = require("../models/userModel");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

//! List All Boards "/board/"
router.get("/", async (req, res) => {
  const allBoards = await BoardModel.find().populate({ path: "lists", populate: { path: "cards" } });
  return res.status(200).send(allBoards);
});

//! Create New Board "/board/create"
router.post("/create", async (req, res) => {
  const { title, userId, background } = req.body;
  if (!title || !userId) return res.status(400).send("Required fields missing");

  const foundUser = UserModel.findOne({ _id: userId });
  if (!foundUser) return res.status(400).send("User not found");

  const newBoard = new BoardModel({
    title: title,
    admin: userId,
    members: userId,
    background,
  });

  try {
    const createdBoard = await newBoard.save();
    return res.status(200).send("Board created successfully");
  } catch (err) {
    return res.status(501).send({
      msg: err.message,
    });
  }
});

//! Get Single Board Info "/board/:id(of the board)"
router.get("/:id", async (req, res) => {
  let boardId = req.params.id;

  let foundBoard = await BoardModel.findOne({ _id: boardId })
    .populate({ path: "lists", populate: { path: "cards", model: "Card" } })
    .populate({ path: "members", select: "boards email username __v _id createdAt updatedAt" });

  if (!foundBoard) return res.status(400).send("Board does not exist");

  return res.status(200).send(foundBoard);
});

//! Create New List in Board "/board/addlist"
// ** get a boardid and adminid  in body make a list and add the id to board
router.post("/addlist", async (req, res) => {
  console.log(req.body);
  const { boardId, userId, title } = req.body;
  if (!boardId || !userId || !title) return res.status(400).send("Required fields missing");

  let foundBoard = await BoardModel.findById(boardId);
  if (!foundBoard) return res.status(400).send("Board does not exist");
  if (!foundBoard.members.includes(userId)) return res.status(404).send("Current user is not board member");

  const newList = new ListModel({
    title: title,
    admin: foundBoard.admin,
  });

  try {
    const createdList = await newList.save();
    foundBoard.lists.push(createdList._id);

    console.log("NEWLYCREATED-LIST:", createdList);

    try {
      foundBoard.save();
    } catch (err) {
      return res.status(501).send(err.message);
    }

    return res.status(200).send("List created successfully");
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

//! Add Member to Board "/board/add"
// **make a member and add the id to board
router.post("/member/add", async (req, res) => {
  const { userId, memberUsername, memberEmail, boardId } = req.body;
  console.log("userId:", userId, "memberUsername:", memberUsername, "memberEmail:", memberEmail, "boardId:", boardId);
  if (!userId || (!memberUsername && !memberEmail) || !boardId) return res.status(400).send("Required fields missing");

  const foundBoard = await BoardModel.findById(boardId);
  if (!foundBoard) return res.status(400).send("Board not found");
  if (foundBoard.admin.toString() !== userId) return res.status(400).send("Current user is not admin");

  const foundUser = memberUsername
    ? await UserModel.findOne({ username: memberUsername })
    : memberEmail
    ? await UserModel.findOne({ email: memberEmail })
    : null;
  if (!foundUser) return res.status(404).send("User not found");

  let isMember;
  for (const member of foundBoard.members) {
    if (member._id.toString() === foundUser._id.toString()) isMember = true;
    console.log(member._id.toString(), foundUser._id.toString());
  }
  if (isMember) return res.status(404).send("User is already a member");

  try {
    const updatedBoard = await BoardModel.findOneAndUpdate({ _id: boardId }, { $addToSet: { members: foundUser._id } });
    return res.status(200).send({ msg: "Member added successfully to board", member: foundUser });
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

//! Remove Member from Board (only if admin) "/board/member/del"
//* get board id admin id and member to delete
router.post("/member/del", async (req, res) => {
  const { userId, memberUsername, memberEmail, boardId } = req.body;
  if (!userId || (!memberUsername && !memberEmail) || !boardId) return res.status(400).send("Required fields missing");

  const foundBoard = await BoardModel.findById(boardId);
  if (!foundBoard) return res.status(400).send("Board not found");
  if (foundBoard.admin.toString() !== userId) return res.status(400).send("Current user is not admin");

  const foundUser = memberUsername
    ? await UserModel.findOne({ username: memberUsername })
    : memberEmail
    ? await UserModel.findOne({ email: memberEmail })
    : null;
  if (!foundUser) return res.status(400).send("User not found");
  if (foundUser._id.toString() === userId) return res.status(400).send("Cannot remove admin");

  let isMember;
  for (const member of foundBoard.members) {
    if (member._id.toString() === foundUser._id.toString()) isMember = true;
  }
  if (!isMember) return res.status(404).send("User is not a member");

  try {
    const updatedBoard = await BoardModel.findOneAndUpdate({ _id: boardId }, { $pull: { members: foundUser._id } });
    return res.status(200).send({ msg: "Member removed successfully", member: foundUser });
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

//! Toggle Visibility of Board "/board/visibility"
//** */ Get the board and admin id check admin and  toggle the boolean
router.post("/visibility", async (req, res) => {
  const { boardId, userId, bool } = req.body;
  // console.log("boardId:", boardId, "userId:", userId, "bool:", bool);
  if (!boardId || !userId || !bool) return res.status(400).send("Required fields missing");

  const foundBoard = await BoardModel.findById(boardId);
  if (!foundBoard) return res.status(400).send("Board not found");
  if (foundBoard.admin.toString() !== userId) return res.status(400).send("Current user is not admin");

  const newActive = bool === "true" ? true : false;

  try {
    // const savedBoard = await foundBoard.save();
    const updatedBoard = await BoardModel.findOneAndUpdate({ _id: boardId }, { $set: { active: newActive } });
    return res.status(200).send("Board visibility updated successfully");
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

//! Edit Board Info (rename, add description, edit description)"/board/edit"
router.post("/edit", async (req, res) => {
  const { title, desc, boardId, userId } = req.body;
  if (!boardId) return res.status(400).send("Required field missing");

  const foundBoard = await BoardModel.findById(boardId);
  if (!foundBoard) return res.status(400).send("Board not found");
  if (foundBoard.admin.toString() !== userId) return res.status(400).send("Current user is not admin");

  if (title) foundBoard.title = title;
  if (desc) foundBoard.desc = desc;

  try {
    const savedBoard = await foundBoard.save();
    return res.status(200).send("Board info updated successfully");
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

module.exports = router;

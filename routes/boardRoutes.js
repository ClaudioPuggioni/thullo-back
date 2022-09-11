const express = require("express");
const router = express.Router();
const BoardModel = require("../models/boardModel");
const ListModel = require("../models/listModel");

//! List All Boards "/board/listall"
router.get("/listall", async (req, res) => {
  const allBoards = await BoardModel.find();
  return res.status(200).send(allBoards);
});

//! Create New Board "/board/create"
router.post("/create", async (req, res) => {
  const { title, userId } = req.body;
  if (!title || !userId) return res.status(400).send("Required fields missing");

  const newBoard = new BoardModel({
    title: title,
    admin: userId,
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

  let foundBoard = await BoardModel.findOne({ _id: boardId });

  if (!foundBoard) return res.status(400).send("Board does not exist");

  return res.status(200).send(foundBoard);
});

//! Create New List in Board "/board/addlist"
// ** get a boardid and adminid  in body make a list and add the id to board
router.post("/addlist", async (req, res) => {
  const { boardId, userId, title } = req.body;
  if (!boardId || !userId || !title) return res.status(400).send("Required fields missing");

  let foundBoard = await BoardModel.findById(boardId);

  if (!foundBoard) return res.status(400).send("Board does not exist");

  const newList = new ListModel({
    title: title,
    admin: foundBoard.admin,
  });

  try {
    const createdList = await newList.save();
    foundBoard.lists.push(createdList._id);

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
  const { memberId, boardId } = req.body;
  if (!memberId || !boardId) return res.status(400).send("Required fields missing");

  try {
    const updatedBoard = await BoardModel.findOneAndUpdate({ _id: boardId }, { $addToSet: { members: memberId } }, { returnDocument: "after" });
    return res.status(200).send("List member added successfully");
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

//! Remove Member from Board (only if admin) "/board/member/del"
//* get board id admin id and member to delete
router.post("/member/del", async (req, res) => {
  const { boardId, memberId } = req.body;
  if (!boardId || !memberId) return res.status(400).send("Required fields missing");

  try {
    const updatedBoard = await BoardModel.findOneAndUpdate({ _id: boardId }, { $pull: { members: memberId } });
    return res.status(200).send("Member removed successfully");
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

//! Toggle Visibility of Board "/board/visibility"
//** */ Get the board and admin id check admin and  toggle the boolean
router.post("/visibility", async (req, res) => {
  const { boardId, userId } = req.body;
  if ((!boardId, !userId)) return res.status(400).send("Required fields missing");

  try {
    let updatedBoard = await BoardModel.findOneAndUpdate(
      { _id: boardId },
      {
        $set: {
          active: {
            $cond: {
              if: {
                $eq: true,
              },
              then: false,
              else: true,
            },
          },
        },
      }
    );
    console.log("UPDATED VISIBILITY:", updatedBoard);
    return res.status(200).send("Board visibility updated successfully");
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

//! Edit Board Info (rename, add description, edit description)"/board/edit"
router.post("/edit", async (req, res) => {
  const { title, desc, boardId } = req.body;
  if (!boardId) return res.status(400).send("Required field missing");

  const foundBoard = await BoardModel.findById(boardId);

  if (!foundBoard) return res.status(400).send("Board not found");

  if (title) foundBoard.title = title;
  if (desc) foundBoard.desc = desc;

  try {
    const updatedBoard = await foundBoard.save();
    return res.status(200).send(updatedBoard);
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

module.exports = router;

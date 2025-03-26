const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Chat = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

const chatRouter = express.Router();

chatRouter.get("/messages/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        {
          fromUserId: userId,
          toUserId: targetUserId,
          status: "accepted",
        },
        {
          fromUserId: targetUserId,
          toUserId: userId,
          status: "accepted",
        },
      ],
    });

    if (!existingConnectionRequest) {
      return res.status(401).json({ message: "You are not friends" });
    }
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }
    return res.json({ chat });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = chatRouter;

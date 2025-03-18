const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_DATA = [
  "firstName",
  "lastName",
  "photoUrl",
  "age",
  "gender",
  "about",
  "skills",
];
userRouter.get("/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

/* SOLUTION 1 */
// userRouter.get("/connections", userAuth, async (req, res) => {
//   try {
//     const loggedInUser = req.user;

//     const connectionRequests = await ConnectionRequest.find({
//       $or: [
//         { toUserId: loggedInUser._id, status: "accepted" },
//         { fromUserId: loggedInUser._id, status: "accepted" },
//       ],
//     })
//       .populate("fromUserId", USER_SAFE_DATA)
//       .populate("toUserId", USER_SAFE_DATA);

//     const data = connectionRequests.map((row) => {
//       if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
//         return row.toUserId;
//       }

//       return row.fromUserId;
//     });

//     res.json({ data: data });
//   } catch (err) {
//     res.status(400).send({ message: err.message });
//   }
// });

/* SOLUTION 2*/
userRouter.get("/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    // Fetch received and sent connections concurrently
    const [receivedConnections, sentConnections] = await Promise.all([
      ConnectionRequest.find({
        toUserId: loggedInUser._id,
        status: "accepted",
      }).populate("fromUserId", USER_SAFE_DATA),
      ConnectionRequest.find({
        fromUserId: loggedInUser._id,
        status: "accepted",
      }).populate("toUserId", USER_SAFE_DATA),
    ]);

    // Extract the connected users from each set
    const receivedUsers = receivedConnections.map((row) => row.fromUserId);
    const sentUsers = sentConnections.map((row) => row.toUserId);

    // Combine both arrays into a single list of connected users
    const allConnectedUsers = [...receivedUsers, ...sentUsers];

    // Send the response
    res.json({ data: allConnectedUsers });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    // User should see all the users except
    // 0. his own card
    // 1. his connections
    // 2. ignored people
    // 3. already sent connections request to (pending requests)

    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    // Find all connection requests (sent + received)

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ toUserId: loggedInUser._id }, { fromUserId: loggedInUser._id }],
    }).select(["fromUserId", "toUserId"]);

    const hideUsersFromFeed = new Set();

    connectionRequests.forEach((request) => {
      hideUsersFromFeed.add(request.fromUserId.toString());
      hideUsersFromFeed.add(request.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

module.exports = userRouter;

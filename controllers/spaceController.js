const AppError = require("../utils/appError");
const Space = require("../models/Space");
const { v4: uuidv4 } = require("uuid");

exports.createSpace = async (req, res, next) => {
  try {
    const spaceID = uuidv4().substring(4, 12);
    const space = await Space.create({
      spaceID,
      admin: req.user.id,
    });

    res.status(200).json({
      status: "success",
      space,
    });
  } catch (err) {
    next(new AppError(err));
  }
};

exports.getSpace = async (req, res, next) => {
  try {
    const space = await Space.findOne({ spaceID: req.body.spaceID });

    res.status(200).json({
      space,
    });
  } catch (error) {
    next();
  }
};

exports.enterSpace = async (req, res, next) => {
  try {
    // 1) Extract spaceID
    const spaceID = req.body.spaceID;
    // 2) Check SpaceId exist or not.
    if (!spaceID) {
      return next(new AppError("Please provide spaceID", 400));
    }

    //3) Id exist then find space in database
    const space = await Space.findOne({ spaceID });
    if (!space) {
      return next(new AppError("Space does not exist.", 400));
    }

    res.status(200).json({
      status: "success",
      space,
    });
  } catch (err) {
    next(err);
  }
};

exports.joinSpaceHandler = async (io, socket) => {
  console.log(`user joined : ${socket.id}`);
  let space;
  socket.on("join-space", async (spaceID) => {
    try {
      await Space.findOneAndUpdate(
        { spaceID },
        { $push: { participants: socket.id } },
        { new: true }
      );
      space = { spaceID: spaceID };
      const participantsList = space.participants.filter(
        (id) => id != socket.id
      );
      if (participantsList.length !== 0) {
        socket.emit("other participants", participantsList);
      }
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("signal", (payload) => {
    socket.to(payload.target).emit("signal", payload);
  });

  socket.on("return signal", (payload) => {
    socket.to(payload.target).emit("return signal", payload);
  });

  socket.on("disconnect", async () => {
    if (space.spaceID) {
      await Space.findOneAndUpdate(
        { spaceID: space.spaceID },
        { $pull: { participants: socket.id } }
      );
    }

    console.log("User disconnected", socket.id);
  });
};

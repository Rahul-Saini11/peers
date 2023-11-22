const mongoose = require("mongoose");
const Users = require("./Users");

const spaceSchema = new mongoose.Schema({
  spaceID: String,
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Users,
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Space = mongoose.model("Space", spaceSchema);

module.exports = Space;

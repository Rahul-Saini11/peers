const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config({ path: "./config.env" });

const server = require("./index");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("connected to database💥");
  });

server.listen(3000, () => {
  console.log("Server is running on prt 3000");
});
//handle the promises rejection whose rejection have not been handled
process.on("unhandledRejection", (err) => {
  console.log("unhandler Rejection! 💥 Shutting down.....");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

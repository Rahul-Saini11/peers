const { Server } = require("socket.io");
const express = require("express");
const http = require("http");
const path = require("path");

const viewRoutes = require("./routes/viewRoutes");
const userRoutes = require("./routes/userRoutes");
const spaceRoutes = require("./routes/spaceRoutes");
const globalErrorHandler = require("./controllers/errorController");
const cookieParser = require("cookie-parser");
const { joinSpaceHandler } = require("./controllers/spaceController");
const app = express();

const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());

app.use("/", viewRoutes);

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/space", spaceRoutes);

io.on("connection", (socket) => {
  joinSpaceHandler(io, socket);
});

app.use(globalErrorHandler);

module.exports = server;

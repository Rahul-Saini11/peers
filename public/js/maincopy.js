const SimplePeer = require("simple-peer");
const socket = io();

//Getting spaceID
const queryString = window.location.search;
const params = new URLSearchParams(queryString);
const spaceID = params.get("spaceId");

const localVideo = document.getElementById("local-user");
const userName = document.getElementById("user-name_1");

//creating remote div
function createElement(name) {
  const div = document.createElement("div");
  div.classList.add("video-wrapper");

  const video = document.createElement("video");
  video.classList.add("video");
  video.autoplay = true;

  const p = document.createElement("p");
  p.classList.add("user-name_1");

  div.appendChild(video);
  div.appendChild(p);

  return div.cloneNode(true);
}

let localStream;
let peers = [];

async function init() {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  localVideo.srcObject = localStream;
  socket.emit("join-space", spaceID);
  console.log("My user ID", socket.id);
}
init();

socket.on("other participants", (participantsList) => {
  participantsList.forEach((userId) => {
    createConnection(userId);
  });
});

// Handling signaling for intial connection
socket.on("signal", (payload) => {
  handleConnection(payload);
});
socket.on("return signal", (payload) => {
  handleReturnSignal(payload);
});

socket.on("room full", () => {
  console.log("room is full");
});

//If user left the room
socket.on("disconnect", () => {
  console.log("user left");
});

const createConnection = (userId) => {
  const peer = new SimplePeer({
    initiator: true,
    trickle: false,
    stream: localStream,
  });
  const obj = {
    userId,
    peer,
  };
  peers.push(obj);
  peer.on("signal", (data) => {
    console.log("sending offer", userId);
    const payload = {
      target: userId,
      caller: socket.id,
      data,
    };
    socket.emit("signal", payload);
  });
  handlerRest(peer);
};

const handleConnection = (payload) => {
  const peer = new SimplePeer({
    initiator: false,
    tricke: false,
    stream: localStream,
  });
  const obj = {
    userId: payload.caller,
    peer,
  };
  peers.push(obj);

  peer.signal(payload.data);
  peer.on("signal", (data) => {
    const payload1 = {
      target: payload.caller,
      caller: socket.id,
      data,
    };
    socket.emit("return signal", payload1);
  });
  handlerRest(peer);
};

function handleReturnSignal(pay) {
  const obj = peers.find((obj) => obj.userId === pay.caller);
  const { peer } = obj;
  peer.signal(pay.data);
}
function handlerRest(peer) {
  peer.on("connect", () => {
    peer.on("data");
  });

  let rmt;
  peer.on("stream", (stream) => {
    rmt = createElement();
    rmt.childNodes[0].id = "remote-user" + Math.floor(Math.random() * 10);
    rmt.childNodes[0].srcObject = stream;
    document.getElementById("left-container").appendChild(rmt);
  });
  peer.on("close", () => {
    document.getElementById("left-container").removeChild(rmt);
  });
}

const vidbtn = document.getElementById("video-btn");
const audbtn = document.getElementById("audio-btn");
const leavebtn = document.getElementById("leave-btn");

async function toggleVideo() {
  let track = localStream.getVideoTracks()[0];
  if (track.enabled) {
    track.enabled = false;
    vidbtn.firstChild.classList.add("video-disable");
    vidbtn.lastChild.classList.remove("video-disable");
    vidbtn.style.backgroundColor = "#5C5470";
  } else {
    track.enabled = true;
    vidbtn.lastChild.classList.add("video-disable");
    vidbtn.firstChild.classList.remove("video-disable");
    vidbtn.style.backgroundColor = "#00ADB5";
  }
}

async function toggleAudio() {
  let track = localStream.getAudioTracks()[0];
  if (track.enabled) {
    track.enabled = false;
    audbtn.firstChild.classList.add("mic-disable");
    audbtn.lastChild.classList.remove("mic-disable");
    audbtn.style.backgroundColor = "#5C5470";
  } else {
    track.enabled = true;
    audbtn.lastChild.classList.add("mic-disable");
    audbtn.firstChild.classList.remove("mic-disable");
    audbtn.style.backgroundColor = "#00ADB5";
  }
}

vidbtn.addEventListener("click", toggleVideo);
audbtn.addEventListener("click", toggleAudio);
leavebtn.addEventListener("click", () => {
  location.assign("/");
});

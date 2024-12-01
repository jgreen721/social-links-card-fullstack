const express = require("express");
const app = express();
const server = require("http").createServer(app);
const PORT = process.env.PORT || 4455;
const io = require("socket.io")(server);
const fs = require("fs");
const { Throttle, PassThrough } = require("./utils/stream.js");

app.use(express.static("public"));

server.listen(PORT, console.log(`Listening in on port ${PORT}.`));

io.on("connection", (socket) => {
  console.log("socketId:", socket.id);

  socket.on("client-data", () => {
    console.log("client has requested app-data");
    let readStream = fs.createReadStream("./assets/flatdata.json", {
      highWaterMark: 1,
    });
    let imageStream = fs.createReadStream("./assets/avatar-jessica.jpeg", {
      highWaterMark: 350,
    });
    let imageSize = fs.statSync("./assets/avatar-jessica.jpeg").size;

    sendClientData(readStream, socket);
    sendImageData(imageStream, socket, imageSize);
  });

  socket.on("disconnect", () => {
    console.log("client has disconnected.");
  });
});

function sendImageData(stream, socket, size) {
  socket.emit("image-size", size);
  // console.log("Filesize",size);
  let imgThrottle = new Throttle(250);
  let imgReport = new PassThrough();
  stream.pipe(imgThrottle).pipe(imgReport);

  imgReport.on("data", (chunks) => {
    console.log("imgChunk", chunks.length);
    socket.emit("img-data", { chunks, len: chunks.length });
  });
}

function sendClientData(readStream, socket) {
  const throttle = new Throttle(5);
  const report = new PassThrough();
  readStream.pipe(throttle).pipe(report);
  let strBuilder = "";

  report.on("data", (chunk) => {
    let character = String(chunk);
    if (character == '"') return;
    if (character == "," || character == "\n") {
      strBuilder = strBuilder.split(":");
      strBuilder = strBuilder.map((value) => value.trim());
      let objectKey = strBuilder[0];
      let objectValue = strBuilder[1];
      let payload = {};
      payload[objectKey] = objectValue;
      payload[objectKey] = objectValue;
      if (objectValue) {
        console.log(payload);
        socket.emit("data", payload);
      }
      strBuilder = "";
      return;
    }
    strBuilder += character;
  });
}

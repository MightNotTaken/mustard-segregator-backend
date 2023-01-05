const express = require("express");
const http = require("http");
const net = require("net");
const child = require("child_process");

const app = express();
app.use(express.static(__dirname + "/"));

const httpServer = http.createServer(app);
const port = 3000;

//send the html page which holds the video tag
app.get("/", function (req, res) {
  res.send("index.html");
});

//stop the connection
app.post("/stop", function (req, res) {
  console.log("Connection closed using /stop endpoint.");
  if (gstMuxer != undefined) {
    gstMuxer.kill(); //kill the GStreamer Pipeline
  }
  gstMuxer = undefined;
  res.end();
});

//send the video stream
app.get("/stream", function (req, res) {
  res.writeHead(200, {
    "Content-Type": "video/webm",
  });

  const tcpServer = net.createServer(function (socket) {
    socket.on("data", function (data) {
      res.write(data);
    });
    socket.on("close", function () {
      console.log("Socket closed.");
      res.end();
    });
  });

  tcpServer.maxConnections = 1;

  tcpServer.listen(function () {
    console.log("Connection started.");
    if (gstMuxer == undefined) {
      console.log("inside gstMuxer == undefined");
      const cmd = "gst-launch-1.0";
      const args = getGstPipelineArguments(this);
      const gstMuxer = child.spawn(cmd, args);
      gstMuxer.stderr.on("data", onSpawnError);
      gstMuxer.on("exit", onSpawnExit);
    } else {
      console.log("New GST pipeline rejected because gstMuxer != undefined.");
    }
  });
});

httpServer.listen(port);
console.log(`Camera Streaming App listening at http://localhost:${port}`);

process.on("uncaughtException", function (err) {
  console.log(err);
});

//functions
function onSpawnError(data) {
  console.log(data.toString());
}

function onSpawnExit(code) {
  if (code != null) {
    console.log("GStreamer error, exit code " + code);
  }
}

function getGstPipelineArguments(tcpServer) {
  const args = [
    "nvarguscamerasrc",
    "!",
    "video/x-raw(memory:NVMM), width=3280, height=2464, format=(string)NV12, framerate=21/1",
    "!",
    "nvvidconv flip-method=0",
    "!",
    "video/x-raw, width=960, height=616, format=(string)BGRx",
    "!",
    "videoconvert",
    "!",
    "video/x-raw, format=(string)BGR",
    "!",
    "appsink wait-on-eos=false max-buffers=1 drop=True",
    "!",
    "tcpclientsink",
    "host=localhost",
    "port=" + tcpServer.address().port,
  ];
  return args;
}

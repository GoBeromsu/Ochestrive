// 라이브러리 && 옵션

import express from "express";
import http from "http";


var minimist = require("minimist");
var url = require("url");
var fs = require("fs");
var ws = require('ws');

var argv = minimist(process.argv.slice(2), {
	default: {
		as_uri: "https://localhost:3000/",
		ws_uri: "ws://localhost:8888/kurento",
	},
});
var options = {
	key: fs.readFileSync("./BackEnd/keys/server.key"),
	cert: fs.readFileSync("./BackEnd/keys/server.crt"),
};

// https Server startup
var app = express();

app.set("view engine", "pug");
app.set("views", "./FrontEnd");
app.use("/public", express.static("./FrontEnd"));
app.get("/", (req, res) => res.render("test"));
app.get("/", (req, res) => res.redirect("/")); // 다른 경로 입력시 /으로 리다이렉트

// // Server set up

var asUrl = url.parse(argv.as_uri);
var port = asUrl.port;
var server = http.createServer(options, app).listen(port, function () {
	console.log("Kurento http Server started");
	console.log("Open " + url.format(asUrl) + " with a WebRTC capable browser");
});


// // https Server

// //Socket IO Option
// // path : 통신 경로 : 프론트엔드에서 script 접근하는 경로
var wsServer = new ws.Server({ server: server });

wsServer.on("connection", (socket) => {
  var sessionId = 0; //일단은 ID의 값을 순차적으로 올려갈 생각입니다
  console.log("Connection reciev3ed with Session ID" + sessionId);

  ws.on("error", function (error) {
    console.log("Connection " + sessionId + " error");
    stop(sessionId);
  });

  ws.on("close", function () {
    console.log("Connection " + sessionId + " closed");
    stop(sessionId);
    userRegistry.unregister(sessionId);
  });

  ws.on("message", function (_message) {
    var message = JSON.parse(_message);
    console.log("Connection " + sessionId + " received message ", message);

    switch (message.id) {
      case "register": //ID 등록
        register(sessionId, message.name, ws);
        break;

      case "call": //피어 간 연결
        call(sessionId, message.to, message.from, message.sdpOffer);
        break;

      case "incomingCallResponse": //
        incomingCallResponse(
          sessionId,
          message.from,
          message.callResponse,
          message.sdpOffer,
          ws
        );
        break;

      case "stop":
        stop(sessionId);
        break;

      case "onIceCandidate":
        onIceCandidate(sessionId, message.candidate);
        break;

      default:
        ws.send(
          JSON.stringify({
            id: "error",
            message: "Invalid message " + message,
          })
        );
        break;
    }
  });
});

function call(callerID, to, from, sdpOffer) {}

function register(id, name, ws, callback) {}

function onIceCandidate(seesionId, _candidate) {}

function stop(seesionId) {}

function clearCandidatesQueue(sessionId) {}

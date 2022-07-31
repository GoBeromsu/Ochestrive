var express = require("express");
var ws = require("ws");
var https = require("https");

var app = express();

// Server set up

var asUrl = url.parse(argv.as_uri);
var port = asUrl.port;

// https Server
var server = https.createServer(options, app).listen(port, function () {
  console.log("Kurento http Server started");
  console.log("Open " + url.format(asUrl) + " with a WebRTC capable browser");
});

//Socket IO Option
// path : 통신 경로 : 프론트엔드에서 script 접근하는 경로
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

function clearCandidatesQueue(sessionId){}
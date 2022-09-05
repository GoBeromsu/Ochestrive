var UserRegistry = require("./user-registry.js");
var UserSession = require("./user-session.js");

var userRegistry = new UserRegistry();
var rooms = {};

var express = require("express");

// kurento required
var path = require("path");
var url = require("url");
var http = require("http");

var kurento = require("kurento-client");

// Constants
var settings = {
  WEBSOCKETURL: "http://localhost:8080/",
  KURENTOURL: "ws://10.246.246.81:10001/kurento",
  // KURENTOURL: "ws://localhost:8888/kurento",
};

/*
 * Server startup
 */
var app = express();
var asUrl = url.parse(settings.WEBSOCKETURL);
var port = asUrl.port;

var server = app.listen(port, function () {
  console.log("Kurento Tutorial started");
  console.log("Open " + url.format(asUrl) + " with a WebRTC capable browser");
});

var io = require("socket.io")(server);

/**
 * Message handlers
 */
io.on("connection", function (socket) {
  var userList = "";
  for (var userId in userRegistry.usersById) {
    userList += " " + userId + ",";
  }
  console.log(
    "receive new client : " + socket.id + " currently have : " + userList
  );
  socket.emit("id", socket.id);

  socket.on("error", function (data) {
    console.log("Connection: " + socket.id + " error : " + data);
    leaveRoom(socket.id, function () { });
  });

  socket.on("disconnect", function (data) {
    console.log("Connection: " + socket.id + " disconnect : " + data);
    leaveRoom(socket.id, function () {
      var userSession = userRegistry.getById(socket.id);
      stop(userSession.id);
    });
  });

  socket.on("message", function (message) {
    console.log("Connection: " + socket.id + " receive message: " + message.id);

    switch (message.id) {
      case "register":
        //클라이언트가 register를 누르면 동작
        console.log("Server : Register " + socket.id);
        register(socket, message.name, function () { });

        //message.coreenum 없음
        //  checkDeskInfo(message.corenum); //desktop 정보 확인
        break;
      case "joinRoom":
        console.log(
          "Server : " + socket.id + " joinRoom : " + message.roomName
        );
        joinRoom(socket, message.roomName, function () { });
        break;
      case "receiveVideoFrom":
        console.log(socket.id + " receiveVideoFrom : " + message.sender);
        receiveVideoFrom(
          socket,
          message.sender,
          message.sdpOffer,
          function () { }
        );
        break;
      case "leaveRoom":
        console.log(socket.id + " leaveRoom");
        leaveRoom(socket.id);
        break;
      case "onIceCandidate":
        addIceCandidate(socket, message);
        break;
      default:
        socket.emit({ id: "error", message: "Invalid message " + message });
    }
  });
});

/**
 * Register user to server
 * @param socket
 * @param name
 * @param callback
 */
function register(socket, name, callback) {
  var userSession = new UserSession(socket.id, socket);
  userSession.name = name;
  userRegistry.register(userSession);
  userSession.sendMessage({
    id: "registered",
    data: "Server : Successfully registered " + socket.id,
  });
  // console.log(userRegistry);
}
/*desktop 정보 확인 */
function checkDeskInfo(corenum, callback) {
  console.log("checkDeskInfo : ", corenum);
  var MEDIA_CONSTRAINTS = {
    audio: true,
    video: {
      width: 640,
      framerate: 15,
    },
  };
  //i3코어이면 화질을 낮춘다?
  if (corenum < 6) {
    //kurento-utils에 getMedia 부분 참고하면 좋을것같다.
    //     constraints = MEDIA_CONSTRAINTS;
    //     navigator.getUserMedia(constraints, function (stream) {
    //       videoStream = stream;
    //       start();
    //   }, callback);
    //   navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    //     videoStream = stream;
    //     start();
    // }).catch(callback);
  }
}
/**
 * Gets and joins room
 * @param socket
 * @param roomName
 * @param callback
 */
function joinRoom(socket, roomName, callback) {
  const room = getRoom(roomName, function (error, room) {
    if (error) {
      callback(error);
    }
  });
  join(socket, room, function (error, user) {
    console.log("join success : " + user.id);
  });
  console.log(room);
}

/**
 * Gets room. Creates room if room does not exist
 * @param roomName
 * @param callback
 */
function getRoom(roomName, callback) {
  let room = rooms[roomName];

  if (room == null) {
    console.log("create new room : " + roomName);
    const kurentoClient = getKurentoClient(function (error, kurentoClient) {
      if (error) {
        return callback(error);
      } // create pipeliRne for room
    });
    const pipeline = kurentoClient.create(
      "MediaPipeline",
      (error, pipeline) => {
        if (error) { return callback(error); }
        pipeline.setLatencyStats(true, error => { if (error) { return callback(error) } })
      }
    );

    room = {
      name: roomName,
      pipeline: pipeline,
      participants: {},
      kurentoClient: kurentoClient,
    };
    rooms[roomName] = room;
  } else {
    console.log("get existing room : " + roomName);
  }
  callback(null, room);

  return room;
}

/**
 * Join (conference) call room
 * @param socket
 * @param room
 * @param callback
 */
function join(socket, room, callback) {
  // create user session
  //  User의 socket id로 유저의 세션을 불러옵니다.

  var userSession = userRegistry.getById(socket.id);
  console.log("userSesssion is " + userSession)
  userSession.setRoomName(room.name);

  var outgoingMedia = room.pipeline.create(
    "WebRtcEndpoint",
    (error, outgoingMedia) => {
      if (error) {
        console.error("no participant in room");
        // no participants in room yet release pipeline
        if (Object.keys(room.participants).length == 0) {
          room.pipeline.release();
        }
        return callback(error);
      }

    }
  );

  // outgoingMedia.setMaxVideoRecvBandwidth(200);
  // outgoingMedia.setMinVideoRecvBandwidth(200);
  userSession.outgoingMedia = outgoingMedia;
  // 엔드 포인트 만들어지기 전에 생긴 candidate를 처리한다
  getIcecandidateBeforeEstablished(userSession, socket);

  // candidate : IP 주소와 포트 넘버의 조합으로 표시된 주소

  userSession.outgoingMedia.on("OnIceCandidate", function (event) {
    console.log("generate outgoing candidate : " + userSession.id);
    var candidate = kurento.register.complexTypes.IceCandidate(event.candidate);
    userSession.sendMessage({
      id: "iceCandidate",
      sessionId: userSession.id,
      candidate: candidate,
    });
  });

  // notify other user that new user is joining
  const usersInRoom = room.participants; // 방 안의 유저들을 불러온다
  const data = {
    id: "newParticipantArrived",
    new_user_id: userSession.id,
  };

  // notify existing user
  for (var i in usersInRoom) {
    usersInRoom[i].sendMessage(data);
  }

  var existingUserIds = [];
  for (var i in room.participants) {
    existingUserIds.push(usersInRoom[i].id);
  }
  // send list of current user in the room to current participant
  userSession.sendMessage({
    id: "existingParticipants",
    data: existingUserIds,
    roomName: room.name,
  });

  // register user to room
  room.participants[userSession.id] = userSession;

}

function getIcecandidateBeforeEstablished(userSession, socket) {
  // add ice candidate the get sent before endpoint is established
  // candidate가 어떻게 생성되는지 알면 해결할 수 있을 듯
  var iceCandidateQueue = userSession.iceCandidateQueue[socket.id];
  if (iceCandidateQueue) {
    while (iceCandidateQueue.length) {
      var message = iceCandidateQueue.shift();
      console.error(
        "user : " + userSession.id + " collect candidate for outgoing media"
      );
      console.log("icecandidate per message : " + message);
      userSession.outgoingMedia.addIceCandidate(message.candidate);
    }
  }
}

/**
 * Leave (conference) call room
 * @param sessionId
 * @param callback
 */
function leaveRoom(sessionId, callback) {
  var userSession = userRegistry.getById(sessionId);

  if (!userSession) {
    return;
  }

  var room = rooms[userSession.roomName];

  if (!room) {
    return;
  }

  console.log(
    "notify all user that " +
    userSession.id +
    " is leaving the room " +
    room.name
  );
  var usersInRoom = room.participants;
  delete usersInRoom[userSession.id];
  userSession.outgoingMedia.release();
  // release incoming media for the leaving user
  for (var i in userSession.incomingMedia) {
    userSession.incomingMedia[i].release();
    delete userSession.incomingMedia[i];
  }

  var data = {
    id: "participantLeft",
    sessionId: userSession.id,
  };
  for (var i in usersInRoom) {
    var user = usersInRoom[i];
    // release viewer from this
    user.incomingMedia[userSession.id].release();
    delete user.incomingMedia[userSession.id];

    // notify all user in the room
    user.sendMessage(data);
  }

  // Release pipeline and delete room when room is empty
  if (Object.keys(room.participants).length == 0) {
    room.pipeline.release();
    delete rooms[userSession.roomName];
  }
  delete userSession.roomName;
}

/**
 * Unregister user
 * @param sessionId
 */
function stop(sessionId) {
  userRegistry.unregister(sessionId);
}

/**
 * Retrieve sdpOffer from other user, required for WebRTC calls
 * @param socket
 * @param senderId
 * @param sdpOffer
 * @param callback
 */
function receiveVideoFrom(socket, senderId, sdpOffer, callback) {
  var userSession = userRegistry.getById(socket.id);
  var sender = userRegistry.getById(senderId);

  getEndpointForUser(userSession, sender, function (error, endpoint) {
    if (error) {
      callback(error);
    }

    endpoint.processOffer(sdpOffer, function (error, sdpAnswer) {
      console.log("process offer from : " + senderId + " to " + userSession.id);
      if (error) {
        return callback(error);
      }
      var data = {
        id: "receiveVideoAnswer",
        sessionId: sender.id,
        sdpAnswer: sdpAnswer,
      };
      userSession.sendMessage(data);

      endpoint.gatherCandidates(function (error) {
        if (error) {
          return callback(error);
        }
      });
      return callback(null, sdpAnswer);
    });
  });
}

/**
 * Get user WebRTCEndPoint, Required for WebRTC calls
 * @param userSession
 * @param sender
 * @param callback
 */
function getEndpointForUser(userSession, sender, callback) {
  // request for self media
  if (userSession.id === sender.id) {
    callback(null, userSession.outgoingMedia);
    return;
  }

  var incoming = userSession.incomingMedia[sender.id];
  if (incoming == null) {
    // console.log(
    //   "user : " +
    //   userSession.id +
    //   " create endpoint to receive video from : " +
    //   sender.id
    // );
    getRoom(userSession.roomName, function (error, room) {
      if (error) {
        return callback(error);
      }
      room.pipeline.create("WebRtcEndpoint", (error, incomingMedia) => {
        if (error) {
          // no participants in room yet release pipeline
          if (Object.keys(room.participants).length == 0) {
            room.pipeline.release();
          }
          return callback(error);
        }
        // console.log(
        //   "user : " + userSession.id + " successfully created pipeline"
        // );
        
        incomingMedia.getStats('AUDIO', (error, statsMap) => {
          if (error) { return callback(error) }
          else{
            console.log(statsMap)
          }
        })
        incomingMedia.setMaxVideoSendBandwidth(100);
        incomingMedia.setMinVideoSendBandwidth(20);
        userSession.incomingMedia[sender.id] = incomingMedia;

        // add ice candidate the get sent before endpoint is established
        var iceCandidateQueue = userSession.iceCandidateQueue[sender.id];
        if (iceCandidateQueue) {
          while (iceCandidateQueue.length) {
            var message = iceCandidateQueue.shift();
            // console.log(
            //   "user : " +
            //   userSession.id +
            //   " collect candidate for : " +
            //   message.data.sender
            // );
            incomingMedia.addIceCandidate(message.candidate);
          }
        }

        incomingMedia.on("OnIceCandidate", function (event) {
          console.log(
            "generate incoming media candidate : " +
            userSession.id +
            " from " +
            sender.id
          );
          var candidate = kurento.register.complexTypes.IceCandidate(
            event.candidate
          );
          userSession.sendMessage({
            id: "iceCandidate",
            sessionId: sender.id,
            candidate: candidate,
          });
        });
        sender.outgoingMedia.connect(incomingMedia, function (error) {
          if (error) {
            callback(error);
          }
          callback(null, incomingMedia);
        });
      });
    });
  } else {
    console.log(
      "user : " +
      userSession.id +
      " get existing endpoint to receive video from : " +
      sender.id
    );
    sender.outgoingMedia.connect(incoming, function (error) {
      if (error) {
        callback(error);
      }
      callback(null, incoming);
    });
  }
}

/**
 * Add ICE candidate, required for WebRTC calls
 * @param socket
 * @param message
 */
function addIceCandidate(socket, message) {
  var user = userRegistry.getById(socket.id);
  if (user != null) {
    // assign type to IceCandidate
    var candidate = kurento.register.complexTypes.IceCandidate(
      message.candidate
    );
    user.addIceCandidate(message, candidate);
  } else {
    console.error("ice candidate with no user receive : " + socket.id);
  }
}

/**
 * Retrieve Kurento Client to connect to Kurento Media Server, required for WebRTC calls
 * @param callback
 * @returns {*}
 */
function getKurentoClient(callback) {
  return kurento(settings.KURENTOURL, function (error, kurentoClient) {
    if (error) {
      var message =
        "Coult not find media server at address " + settings.KURENTOURL;
      return callback(message + ". Exiting with error " + error);
    }

    callback(null, kurentoClient);
  });
}

/**
 * Generate unique ID, used for generating new rooms
 * @returns {string}
 */
function generateUUID() {
  var d = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
}


app.use(express.static(path.join(__dirname, "static")));

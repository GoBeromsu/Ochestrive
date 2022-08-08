/**
 * Created by eak on 9/14/15.
 */


var socket = io.connect();
var localVideoCurrentId;
var localVideo;
var sessionId;

var participants = {};

window.onbeforeunload = function () {
    socket.disconnect();
};

socket.on("id", function (id) {
    console.log("receive id : " + id);
    sessionId = id;
});

// message handler
socket.on("message", function (message) {
    switch (message.id) {
        case "registered":
            disableElements("register");
            console.log(message.data);
            break;
        case "incomingCall":
            incomingCall(message);
            break;
        case "callResponse":
            console.log(message);
            console.log(message.message);
            break;
        case "existingParticipants":
            console.log("existingParticipants : " + message.data);
            onExistingParticipants(message);
            break;
        case "newParticipantArrived":
            console.log("newParticipantArrived : " + message.new_user_id);
            onNewParticipant(message);
            break;
        case "participantLeft":
            console.log("participantLeft : " + message.sessionId);
            onParticipantLeft(message);
            break;
        case "receiveVideoAnswer":
            console.log("receiveVideoAnswer from : " + message.sessionId);
            onReceiveVideoAnswer(message);
            break;
        case "startRecording":
            console.log("Starting recording");
            break;
        case "stopRecording":
            console.log("Stopped recording");
            break;
        case "iceCandidate":
            console.log("iceCandidate from : " + message.sessionId);
            var participant = participants[message.sessionId];
            if (participant != null) {
                console.log(message.candidate);
                participant.rtcPeer.addIceCandidate(message.candidate, function (error) {
                    if (error) {
                        if (message.sessionId === sessionId) {
                            console.error("Error adding candidate to self : " + error);
                        } else {
                            console.error("Error adding candidate : " + error);
                        }
                    }
                });
            } else {
                console.error('still does not establish rtc peer for : ' + message.sessionId);
            }
            break;
        default:
            console.error("Unrecognized message: ", message);
    }
});

/**
 * Send message to server
 * @param data
 */
function sendMessage(data) {
    socket.emit("message", data);
}

/**
 * Register to server
 * 유저 이름 정보를 등록하는 함수 
 * 가장 먼저 실행된다.
 */
function register() {
    console.log('Client : Register user name')
    var data = {
        id: "register",
        name: document.getElementById('userName').value
    };
    sendMessage(data);
}

/**
 * Check if roomName exists, use DOM roomName otherwise, then join room
 * @param roomName
 */
function joinRoom() {
    disableElements('joinRoom');
    roomName = document.getElementById('roomName').value;
    if (!roomName) {
        // 무조건 방을 생성하는 버그 있음
        alert('방 이름을 입력하시오')

    }

    var data = {
        id: "joinRoom",
        roomName: roomName
    };
    sendMessage(data);
}

/**
 * Invite other user to a conference call
 */
function call() {
    // Not currently in a room
    disableElements("call");
    var message = {
        id: 'call',
        from: document.getElementById('userName').value,
        to: document.getElementById('otherUserName').value
    };
    sendMessage(message);
}

/**
 * Tell room you're leaving and remove all video elements
 */
function leaveRoom() {

    disableElements("leaveRoom");
    var message = {
        id: "leaveRoom"
    };

    participants[sessionId].rtcPeer.dispose();
    sendMessage(message);
    participants = {};

    var myNode = document.getElementById("video_list");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
}

/**
 * Javascript Confirm to see if user accepts invite
 * @param message
 */
function incomingCall(message) {
    var joinRoomMessage = message;
    if (confirm('User ' + message.from
        + ' is calling you. Do you accept the call?')) {
        if (Object.keys(participants).length > 0) {
            leaveRoom();
        }
        console.log('message');
        console.log(message);
        joinRoom(joinRoomMessage.roomName);
    } else {
        var response = {
            id: 'incomingCallResponse',
            from: message.from,
            callResponse: 'reject',
            message: 'user declined'
        };
        sendMessage(response);
    }
}

/**
 * Request video from all existing participants
 * @param message
 */
function onExistingParticipants(message) {
    // Standard constraints
    var constraints = {
        audio: true,
        video: {
            frameRate: {
                min: 1, ideal: 15, max: 30
            },
            width: {
                min: 32, ideal: 50, max: 320
            },
            height: {
                min: 32, ideal: 50, max: 320
            }
        }
    };

    // Temasys constraints
    /*var constraints = {
     audio: true,
         video: {
             mandatory: {
                 minWidth: 32,
                 maxWidth: 320,
                 minHeight: 32,
                 maxHeight: 320,
                 maxFrameRate: 30,
                 minFrameRate: 1
             }
         }
     };*/

    console.log(sessionId + " register in room " + message.roomName);

    // create video for current user to send to server
    var localParticipant = new Participant(sessionId);
    participants[sessionId] = localParticipant;
    localVideo = document.getElementById("local_video");
    var video = localVideo;

    // bind function so that calling 'this' in that function will receive the current instance
    var options = {
        localVideo: video,
        mediaConstraints: constraints,
        onicecandidate: localParticipant.onIceCandidate.bind(localParticipant)
    };


    localParticipant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function (error) {
        if (error) {
            return console.error(error);
        }

        // Set localVideo to new object if on IE/Safari
        localVideo = document.getElementById("local_video");

        // initial main video to local first
        localVideoCurrentId = sessionId;
        localVideo.src = localParticipant.rtcPeer.localVideo.src;
        localVideo.muted = true;

        console.log("local participant id : " + sessionId);
        this.generateOffer(localParticipant.offerToReceiveVideo.bind(localParticipant));
    });

    // get access to video from all the participants
    console.log(message.data);
    for (var i in message.data) {
        receiveVideoFrom(message.data[i]);
    }
}

/**
 * Add new participant locally and request video from new participant
 * @param sender
 */
function receiveVideoFrom(sender) {
    console.log(sessionId + " receive video from " + sender);
    var participant = new Participant(sender);
    participants[sender] = participant;

    var video = createVideoForParticipant(participant);

    // bind function so that calling 'this' in that function will receive the current instance
    var options = {
        remoteVideo: video,
        onicecandidate: participant.onIceCandidate.bind(participant)
    };

    participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function (error) {
        if (error) {
            return console.error(error);
        }
        this.generateOffer(participant.offerToReceiveVideo.bind(participant));
    });
}

/**
 * Receive video from new participant
 * @param message
 */
function onNewParticipant(message) {
    receiveVideoFrom(message.new_user_id)
}

/**
 * Destroy videostream/DOM element on participant leaving room
 * @param message
 */
function onParticipantLeft(message) {
    var participant = participants[message.sessionId];
    participant.dispose();
    delete participants[message.sessionId];

    console.log("video-" + participant.id);
    // remove video tag
    //document.getElementById("video-" + participant.id).remove();
    var video = document.getElementById("video-" + participant.id);

    // Internet Explorer doesn't know element.remove(), does know this
    video.parentNode.removeChild(video);
}

/**
 * Required WebRTC method
 * @param message
 */
function onReceiveVideoAnswer(message) {
    var participant = participants[message.sessionId];
    participant.rtcPeer.processAnswer(message.sdpAnswer, function (error) {
        if (error) {
            console.error(error);
        } else {
            participant.isAnswer = true;
            while (participant.iceCandidateQueue.length) {
                console.error("collected : " + participant.id + " ice candidate");
                var candidate = participant.iceCandidateQueue.shift();
                participant.rtcPeer.addIceCandidate(candidate);
            }
        }
    });
}

/**
 * Start recording video
 */
function startRecording() {
    var data = {
        id: "startRecording"
    };
    sendMessage(data);
}

/**
 * Stop recording video
 */
function stopRecording() {
    var data = {
        id: "stopRecording"
    };
    sendMessage(data);
}

/**
 * Create video DOM element
 * @param participant
 * @returns {Element}
 */
function createVideoForParticipant(participant) {

    var videoId = "video-" + participant.id;
    var video = document.createElement('video');

    video.autoplay = true;
    video.id = videoId;
    video.poster = "img/webrtc.png";
    document.getElementById("video_list").appendChild(video);

    // return video element
    return document.getElementById(videoId);
}

function disableElements(functionName) {
    if (functionName === "register") {
        document.getElementById('userName').disabled = true;
        document.getElementById('register').disabled = true;
        document.getElementById('joinRoom').disabled = false;
        document.getElementById('roomName').disabled = false;
        document.getElementById('sendInvite').disabled = false;
        document.getElementById('otherUserName').disabled = false;
    }
    if (functionName === "joinRoom") {
        document.getElementById('roomName').disabled = true;
        document.getElementById('joinRoom').disabled = true;
        document.getElementById('sendInvite').disabled = false;
        document.getElementById('otherUserName').disabled = false;
        document.getElementById('leaveRoom').disabled = false;
        document.getElementById('startRecording').disabled = false;
        document.getElementById('stopRecording').disabled = false;
    }
    if (functionName === "leaveRoom") {
        document.getElementById('leaveRoom').disabled = true;
        document.getElementById('roomName').disabled = false;
        document.getElementById('joinRoom').disabled = false;
        document.getElementById('sendInvite').disabled = false;
        document.getElementById('otherUserName').disabled = false;
        document.getElementById('startRecording').disabled = true;
        document.getElementById('stopRecording').disabled = true;
    }
    if (functionName === "call") {
        document.getElementById('roomName').disabled = true;
        document.getElementById('joinRoom').disabled = true;
        document.getElementById('leaveRoom').disabled = false;
    }
}
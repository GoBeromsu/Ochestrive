const localVideo = document.getElementById("local_video");
const camerasSelect = document.getElementById("cameras");

const audioSelect = document.getElementById("audios");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");


let myStream
let muted = false;
let cameraOff = false;
let socket = io.connect();
let localVideoCurrentId;
let sessionId;
let participants = {};
let localParticipant //로컬 참여자 : Peer Connection 저장하는 곳


// 카메라를 가져옵니다.
async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        // console.log(devices)
        const cameras = devices.filter((device) => device.kind === "videoinput");
        // console.log(cameras)
        const currentCamera = myStream.getVideoTracks()[0];

        cameras.forEach((camera) => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCamera.label === camera.label) {
                option.selected = true;
            }
            camerasSelect.appendChild(option);
        })

    }
    catch (e) {
        console.log(e)
    }
}

// 오디오를 가져옵니다.
async function getAudios() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        // console.log(devices)
        const audios = devices.filter((device) => device.kind === "audioinput");
        console.log(audios)

        audios.forEach((audio) => {
            const option = document.createElement("option");
            option.value = audio.deviceId;
            option.innerText = audio.label;

            audioSelect.appendChild(option);
        })

    }
    catch (e) {
        console.log(e)
    }
}


async function getMedia(deviceId) {
    const initialConstraint = {
        audio: true,
        video: { deviceId: { exact: deviceId } }
    }
    const cameraConstraints = {
        audio: true,
        video: { deviceId: { exact: deviceId } },
    };

    try {
        myStream = await navigator.mediaDevices.getUserMedia(deviceId ? cameraConstraints : initialConstraint);
        console.log(myStream)
        localVideo.srcObject = myStream;

        if (!deviceId) {
            await getCameras();
            await getAudios();
        }

    }
    catch (e) {
        console.log(e)
    }

}

function handleMuteClick() {
    myStream
        .getAudioTracks()
        .forEach((track) => (track.enabled = !track.enabled));
    if (!muted) {
        muteBtn.innerText = "Unmute";
        muted = true;
    } else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}
function handleCameraClick() {
    myStream
        .getVideoTracks()
        .forEach((track) => (track.enabled = !track.enabled));
    if (cameraOff) {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}


// 공부 필요함
async function handleCameraChange() {
    await getMedia(camerasSelect.value);
    if (localParticipant.src) {
        const videoTrack = myStream.getVideoTracks()[0];
        const videoSender = localParticipant.src
            .getSenders()
            .find((sender) => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
    }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);


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
            break
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
        case "iceCandidate":
            //participants에 이미 넣어져 있음 
            // Join Room에서 부를 때는 일종의 예외 처리임, participants가 없다
            let participant = participants[message.sessionId];
            console.log(participant)
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

async function register() {
    console.log('Client : Register user name')
    var data = {
        id: "register",
        name: document.getElementById('userName').value
    };
    sendMessage(data);
    await getMedia();
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


const StandardConstraints = {
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
}

const mandatoryConstraints = {
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
}

/**
 * Request video from all existing participants
 * 현재 유저의 로컬 비디오 영상 제작 및 기존 방에 들어와 있던 유저들 출력
 * @param message
 */
function onExistingParticipants(message) {
    // set constraints
    const constraints = mandatoryConstraints

    console.log(sessionId + " register in room " + message.roomName);

    // create video for current user to send to server

    setLocalParticipantVideo(constraints, sessionId)

    // get access to video from all the participants
    // 기존에 방에 들어와 있던 유저들을 추가합니다.
    console.log(message.data);
    for (var i in message.data) {
        receiveVideoFrom(message.data[i]);
    }
}
// 유저의 로컬 비디오 영상 스트림 생성 및 배포
function setLocalParticipantVideo(constraints, sessionId) {
    localParticipant = new Participant(sessionId);
    participants[sessionId] = localParticipant;

    const video = localVideo;

    // bind function so that calling 'this' in that function will receive the current instance
    const options = {
        localVideo: video,
        mediaConstraints: constraints,
        onicecandidate: localParticipant.onIceCandidate.bind(localParticipant)
    };

    //RTC Peer를 통해서 Data에 접근할 수 있겠고만
    localParticipant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function (error) {
        if (error) {
            return console.error(error);
        }

        // Set localVideo to new object if on IE/Safari


        // initial main video to local first
        // Stream 제어 기능
        localVideoCurrentId = sessionId;
        localVideo.src = localParticipant.rtcPeer.localVideo.src;
        localVideo.muted = true;

        console.log("local participant id : " + sessionId);
        this.generateOffer(localParticipant.offerToReceiveVideo.bind(localParticipant));//SDP 생성
    });
}


/**
 * Add new participant locally and request video from new participant
 * 새로운 참가자를 클라이언트에게 등록, 새로운 참가자에게 비디오 요청
 * @param sender
 */
function receiveVideoFrom(sender) {
    console.log(sessionId + " receive video from " + sender);
    const participant = registerParticipant(sender)

    var video = createVideoForParticipant(participant);//비디오가 들어갈 공간을 부여합니다.

    // bind function so that calling 'this' in that function will receive the current instance
    var options = {
        remoteVideo: video,//새로운 참여자의 화면인 remote 비디오 stream이 들어갈 공간
        onicecandidate: participant.onIceCandidate.bind(participant)// 새로운 참가자의 icecandidate
    };
    //WebRtcPeerRecvonly : WebRtcPeer as receive only.
    participant.rtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function (error) {
        if (error) {
            return console.error(error);
        }
        this.generateOffer(participant.offerToReceiveVideo.bind(participant));//SDP 생성
    });
}

// 클라이언트에게 참여자를 등록하는 함수
function registerParticipant(sender) {
    const participant = new Participant(sender);
    participants[sender] = participant;
    return participant
}



/**
 * Receive video from new participant
 * @param message
 */
function onNewParticipant(message) {
    // 새로운 참가자가 왔는데 그냥 스트림 보낼 공간만 만들고 빠진다고? 굳이?
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
 * @param participant
 * @returns {Element}
 * 유저의 영상 스트림을 내보낼 공간을 만든다
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

        document.getElementById('otherUserName').disabled = false;
    }
    if (functionName === "joinRoom") {
        document.getElementById('roomName').disabled = true;
        document.getElementById('joinRoom').disabled = true;

        document.getElementById('otherUserName').disabled = false;
        document.getElementById('leaveRoom').disabled = false;

    }
    if (functionName === "leaveRoom") {
        document.getElementById('leaveRoom').disabled = true;
        document.getElementById('roomName').disabled = false;
        document.getElementById('joinRoom').disabled = false;

        document.getElementById('otherUserName').disabled = false;

    }
    if (functionName === "call") {
        document.getElementById('roomName').disabled = true;
        document.getElementById('joinRoom').disabled = true;
        document.getElementById('leaveRoom').disabled = false;
    }
}

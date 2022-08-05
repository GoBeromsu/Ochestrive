// 라이브러리 && 옵션
import { instrument } from "@socket.io/admin-ui";
import { Server } from "socket.io";
import express from "express";
import https from "https";
import fs from "fs";
import url from "url";
import minimist from "minimist";
import kurento from 'kurento-client';


import UserSession from './user-session';
import UserRegistry from "./user-registry";

var userRegistry = new UserRegistry();


const argv = minimist(process.argv.slice(2), {
	default: {
		as_uri: "https://localhost:3000/",
		ws_uri: "ws://localhost:8888/kurento"
	}
});
const options = {
	key: fs.readFileSync("./BackEnd/keys/server.key"),
	cert: fs.readFileSync("./BackEnd/keys/server.crt"),
};


// https Server startup
const app = express();

app.set("view engine", "pug");
app.set("views", './FrontEnd'); // express() default 구조 변경을 위함 -> view
app.use(express.static("./FrontEnd"));// FrontEnd를 위한 정적 경로 생성
app.get("/", (req, res) => res.render("test"));
app.get("/", (req, res) => res.redirect("/")); // 다른 경로 입력시 /으로 리다이렉트

// Server set up
let asUrl = url.parse(argv.as_uri);
let port = asUrl.port;
let httpsServer = https.createServer(options, app);
let wsUrl = asUrl.href;
const handleListen = () => {
	console.log("Kurento http Server started");
	console.log("Open " + url.format(asUrl) + " with a WebRTC capable browser");
};

// https Server
// https 접속 안되면 크롬에서 chrome://flags/#allow-insecure-localhost를 enabled로 바꿀 것
//Socket IO Option
// path : 통신 경로 : 프론트엔드에서 script 접근하는 경로
const wsServer = new Server(httpsServer, {
	cors: {
		//데모 적용 가능
		origin: ["https://admin.socket.io"],
		credentials: true,
	},
}); //http 서버 위에 socket 서버, admin UI 적용
instrument(wsServer, {
	auth: false,
});


// 변수
let rooms = {};//방을 저장하는 공간
let userController = new UserRegistry;


// Socket Server
wsServer.on("connection", (socket) => {
	console.log('Connected Server')
	// Error 발생
	socket.on("error", error => {
		console.log("Connection error");
	});

	// 연결 끊겼을 때
	socket.on("disconnect", () => {
		console.log("Connection  closed");
	});

	socket.on('message', _message => {
		var message = JSON.parse(_message);
		console.log(`Server : %s receive message`, message.id);

		switch (message.id) {
			case 'register':
				console.log('Server : ' + socket.id + '를 등록 중에 있습니다')
				register(socket, message.name, function () { })
				break;
			case 'joinRoom':
				joinRoom(socket, message, err => {
					if (err) {
						console.error(`join Room error ${err}`);
					}
				});
				break;
			case 'receiveVideoFrom':
				receiveVideoFrom(socket, message.sender, message.sdpOffer, (error) => {
					if (error) {
						console.error(error);
					}
				});
				break;
			case 'leaveRoom':
				leaveRoom(socket, (error) => {
					if (error) {
						console.error(error);
					}
				});
				break;
			case 'onIceCandidate':
				addIceCandidate(socket, message, (error) => {
					if (error) {
						console.error(error);
					}
				});
				break;
			default:
				socket.emit({ id: 'error', msg: `Invalid message ${message}` });
		}
	});
});



function register(socket, name, callback) {
	var userSession = new UserSession(socket.id, socket);//새로운 유저 세션을 만듭니다.
	userSession.name = name; // 유저의 이름을 등록합니다.
	userRegistry.register(userSession);
	userSession.sendMessage({
		id: 'registered',
		data: 'Successfully registered' + socket.id
	})
}


function joinRoom(socket, message, callback) {

	// Get Room
	getRoom(message.roomName, (error, room) => {
		if (error) {
			callback(error);
			return;
		}
		// User를 방에 참가 시킨다
		join(socket, room, message.name, (err, user) => {
			console.log(`join success : ${user.name}`);
			if (err) {
				callback(err);
				return;
			}
			callback();
		});
	});
}

function getRoom(roomName, callback) {

	let room = rooms[roomName];

	if (room == null) {
		console.log(`create new room : ${roomName}`);

		getKurentoClient((error, kurentoClient) => {

			// 처음 방 생성하는 코드
			kurentoClient.create('MediaPipeline', (error, pipeline) => {
				if (error) {
					return callback(error);
				}
				room = {
					name: roomName,
					pipline: pipeline,
					participants: {},
					kurentoClient: kurentoClient
				}
				rooms[roomName] = room;
				callback(null, room)

			})
			console.log(room)
		})
	}
	else {
		console.log(`get existing room : ${roomName}`);
		callback(null, room);
	}

}


function join(socket, room, userName, callback) {
	console.log("hihi")
	// Session에 유저를 더합니다
	let userSession = new UserSession(socket, userName, room.name);

	// 유저를 등록합니다.
	userController.register(userSession);


}

// Kurento Client를 통해서 개발자들은 Kurento를 다룰 수 있다
// 코드 흐름상 Kurento를 처음 만드는 곳은 Get Room -> 방을 만들 때이다.
var kurentoClient;
function getKurentoClient(callback) {

	kurento(wsUrl, (error, _kurentoClient) => {
		if (error) {
			let message = `Could not find media server at address ${wsUrl}`;
			return callback(`${message} . Exiting with error ${error}`);
		}

		kurentoClient = _kurentoClient
		kurentoClient.
			callback(null, _kurentoClient);
	})
};

httpsServer.listen(port, handleListen);
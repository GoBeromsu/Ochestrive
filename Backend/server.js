// 라이브러리 && 옵션
import { instrument } from "@socket.io/admin-ui";
import { Server } from "socket.io";
import express from "express";
import https from "https";
import fs from 'fs'; 
import path from 'path';
import url from 'url';
import minimist from 'minimist';
// const minimist = require("minimist");
// const url = require("url");
// const fs = require("fs");

const argv = minimist(process.argv.slice(2), {
	default: {
		as_uri: "https://localhost:3000/",
		ws_uri: "ws://localhost:8888/kurento",
	},
});
const options = {
	key: fs.readFileSync("./BackEnd/keys/server.key"),
	cert: fs.readFileSync("./BackEnd/keys/server.crt"),
};

// https Server startup
const app = express();

app.set("view engine", "pug");
app.set("views", "./FrontEnd"); // express() default 구조 변경을 위함 -> view
app.use("/public", express.static("./FrontEnd"));
app.get("/", (req, res) => res.render("test"));
app.get("/", (req, res) => res.redirect("/")); // 다른 경로 입력시 /으로 리다이렉트

// // Server set up

const asUrl = url.parse(argv.as_uri);
const port = asUrl.port;
const httpsServer = https.createServer(options, app);
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

wsServer.on("connection", (socket) => {
	const sessionId = 0; //일단은 ID의 값을 순차적으로 올려갈 생각입니다
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
		const message = JSON.parse(_message);
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
					ws,
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
					}),
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

httpsServer.listen(port, handleListen);

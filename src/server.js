//백엔드
import express from "express";
import { Server } from "socket.io";
// import WebSocket from "ws";
import http from "http";

const app = express();
//설정
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
//경로 설정
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/")); //다른 경로 입력해도 /으로 리다이렉트

const handleListen = () => console.log(`Listening on http://localhost:3000`);

//같은 포트에 두 종류 서버 함께 돌리기
const httpServer = http.createServer(app); //http 서버
const wsServer = new Server(httpServer); //http 서버 위에 socket 서버

wsServer.on("connection", (socket) => {
  socket.onAny((event) => {
    //이벤트마다
    console.log(`Socket Event:${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName); //방에 참가하기(없으면 roomName으로 방 만듬)
    done(); //방 입력창 숨기고 참가한 방 보여주기
    socket.to(roomName).emit("welcome"); //roomName 방에 참가한 모든 사람들에게(나 제외) 이벤트 메세지 보내기
  });
  socket.on("disconnecting", () => {
    //연결 끊어지려고할때
    socket.rooms.forEach((room) => socket.to(room).emit("bye"));
  });
  //메세지 오면
  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", msg); //메세지 뿌리기
    done();
  });
});

// //db(연결된 소켓 저장)
// const sockets = [];
// //ws서버 연결시
// wss.on("connection", (socket) => {
//   sockets.push(socket); //db에 방금 연결된 소켓 추가
//   socket["nickname"] = "Anon"; //nickname 기본값
//   console.log("Connected to Browser✅");
//   //행동 정의
//   socket.on("close", () => console.log("Disconnected from the Browser❌")); //서버 닫히면 실행
//   socket.on("message", (msg) => {
//     //메세지의 종류에 따라 행동
//     const message = JSON.parse(msg); //string을 object로 바꿔주기
//     switch (message.type) {
//       case "new_message": //메세지 모든 소켓에게 뿌려주기
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname}: ${message.payload}`)
//         );
//       case "nickname": //닉네임 설정시 소켓에 닉네임 추가
//         socket["nickname"] = message.payload; //소켓은 객체이므로 어떤것이든 추가 가능
//     }
//   });
// });
httpServer.listen(3000, handleListen);

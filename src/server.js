// ExpressJS, app.get(), Pug, (req,res) =>
// package.json
// Babel
// nodemon
import http from "http";
import express from "express";
import WebSocket from "ws";
const app = express();
//렌더링할 view 엔진 설정과 그경로
app.set("view engine", "pug");
app.set("views", __dirname + "/views");

// 정적 경로 설정 -> 유저에게 파일 공유
// 유저가 Public 폴더로 이동하면 그 파일을 볼 수 있다
app.use("/public", express.static(__dirname + "/public"));
//home.pug를 렌더링 해주는 renderer
app.get("/", (_, res) => res.render("home"));
// 유저가 어떤 url로 이동하던 다시 home으로 redirect 해주는 것임
app.get("/*", (_, res) => res.redirect("/"));
const handleListen = () => console.log(`Listening on http://localhost:3000`);
// app.listen(3000, handleListen);

//createServer에 등장하는 리퀘스트 핸들러는 app이다!
// 이제는 app.listen 하기 전에 서버에 접근할 수 있음
// http가 필요한 이유는 위에 redirect, view 등의 기능이 필요하기 때문이다
const server = http.createServer(app);
// 이렇게 하면 http 서버와 socket 서버를 동시에 운영할 수 있다
// 두 서버를 같은 포트에서 사용하길 원하기 때문이다
const wss = new WebSocket.Server({ server });
function handleConnection(socket) {
  console.log(socket);
}
wss.on("connection", (socket) => {
  //서버가 아닌 직접적으로 소켓에 접근 할 수 있다

  console.log("Connected Browser");
  socket.on("message", (message) => {
    console.log(message);
  });
  socket.on("close", () => {
    console.log("Disconnected from the Browser");
  });
  socket.send("heelo!"); //Connection이 생기면 바로 SOCKET에 메세지를 보낸다
});
// 내 http 서버에 접근 할 수 있고 http 서버 위에 Web Socket 서버를 만들 수 있음
// 물론 꼭 이렇게 할 필요가 없긴하다
server.listen(3000, handleListen);

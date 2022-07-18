import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {//연결된 포트로 데이터가 들어오는지 지켜보는거야
  socket.on("join_room", (roomName, done) => {//클라이언트에게 데이터를 받아온다, roomName과 done을
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome");//Client에게 다시 응답을 ㅂ
  });
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);

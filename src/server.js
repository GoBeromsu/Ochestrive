// ExpressJS, app.get(), Pug, (req,res) =>
// package.json
// Babel
// nodemon

import express from "express";

const app = express();
//렌더링할 view 엔진 설정과 그경로
app.set("view engine", "pug");
app.set("views", __dirname + "/views");

// 정적 경로 설정 -> 유저에게 파일 공유
app.use("public", express.static(__dirname + "public"));

app.get("/", (req, res) => res.render("home")); //home.pug를 렌더링 해주는 renderer
const handleListen = () => console.log(`Listening on http://localhost:3000`);
app.listen(3000, handleListen);

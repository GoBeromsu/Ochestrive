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
// 유저가 Public 폴더로 이동하면 그 파일을 볼 수 있다
app.use("public", express.static(__dirname + "public"));

//home.pug를 렌더링 해주는 renderer
app.get("/", (req, res) => res.render("home"));
// 유저가 어떤 url로 이동하던 다시 home으로 redirect 해주는 것임
app.get("/*",(req,res )=> res.redirect("/"));
const handleListen = () => console.log(`Listening on http://localhost:3000`);
app.listen(3000, handleListen);

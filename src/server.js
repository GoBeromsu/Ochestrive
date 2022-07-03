import express from "express";

const app = express();
//설정
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
//경로 설정
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/")); //다른 경로 입력해도 /으로 리다이렉트

const handleListen = () => console.log(`Listening on http://localhost:3000`);
app.listen(3000, handleListen); //포트번호 3000

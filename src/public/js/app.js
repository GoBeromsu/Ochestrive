//프론트엔드: 브라우저 (소켓 생성하고 보여주기)
const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");
//webSocket은 브라우저와 서버사이의 연결
const socket = new WebSocket(`ws://${window.location.host}`); //소켓 생성

//메세지에+종류 정보 합치기
function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}
//소켓 열렸을때
socket.addEventListener("open", () => {
  console.log("Connected to Server✅");
});
//메세지 받으면
socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li); //li에 추가
});
//서버와 끊어지면
socket.addEventListener("close", () => {
  console.log("Disconnected from the Server❌");
});
// //10초 뒤에 서버로 메세지 보내기
// setTimeout(() => {
//   socket.send("hello from the browser");
// }, 10000);

//메세지 제출시 submit하기
function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input"); //브라우저 입력값
  socket.send(makeMessage("new_message", input.value)); //백엔드로 보내기
  const li = document.createElement("li");
  li.innerText = `You: ${input.value}`;
  messageList.append(li); //li에 추가
  input.value = "";
}
//닉네임 submit
function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input"); //브라우저 입력값
  socket.send(makeMessage("nickname", input.value)); //백엔드로 보내기
  input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);

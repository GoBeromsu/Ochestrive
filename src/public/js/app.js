// front의 객체와 아ㅓ래와 같은 형식으로 연결되는거임
// listener에 들어가는 것은 지정되어 있음
// btn.addEventListener("click", fn);
const socket = new WebSocket(`ws://${window.location.host}`);
socket.addEventListener("open", () => {
  console.log("Connected to Server");
});

socket.addEventListener("message", (message) => {
  //messsage 객체로 데이터를 받아서 접근할 수 있음!
  console.log("New message : ", message.data, "from the Server");
});

socket.addEventListener("close", () => {
  console.log("DisConnected from Server X");
});

setTimeout(() => {
  socket.send("hello form the browser!");
}, 3000);

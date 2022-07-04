//프론트엔드: 브라우저 (소켓 생성하고 보여주기)
const socket = io(); //벡엔드와 소켓 연결

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true; //room element 숨기기

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li); //ul에 element 추가하기
}
function handleMessageSubmit(event) {
  //메세지 보내기
  event.preventDefault();
  const input = room.querySelector("input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`); //나를 제외하고 소켓 보내므로 내 창에 띄우기
  });
  input.value = "";
}

function showRoom() {
  welcome.hidden = true; //방번호 입력창 숨기고
  room.hidden = false; //방 보여주기
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  //메세지 보내는 창
  const form = room.querySelector("form");
  form.addEventListener("submit", handleMessageSubmit); //제출버튼 누르면
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector("input");
  //emit : 이벤트+메세지 전송
  socket.emit("enter_room", input.value, showRoom); //인자여러개, 마지막은 함수
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit); //방 들어가기 버튼 누르면

socket.on("welcome", () => {
  //방 들어오면
  addMessage("someone joined!");
});

socket.on("bye", () => {
  //방 나가면
  addMessage("someone left!");
});

socket.on("new_message", (msg) => {
  //메세지 오면
  addMessage(msg);
});

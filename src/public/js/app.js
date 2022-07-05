//프론트엔드: 브라우저 (소켓 생성하고 보여주기)
const socket = io(); //벡엔드와 소켓 연결

const welcome = document.getElementById("welcome");
const roomForm = welcome.querySelector("#roomName");
const room = document.getElementById("room");
const nameForm = welcome.querySelector("#nickname");

room.hidden = true; //room element 숨기기

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li); //ul에 element 추가하기
}
//메세지 보내기
function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`); //나를 제외하고 소켓 보내므로 내 창에 띄우기
  });
  input.value = "";
}
//닉네임 설정
function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = welcome.querySelector("#nickname input"); //msg의 input 가져오기
  socket.emit("nickname", input.value); //닉네임 이벤트 메세지 보내기
}

function showRoom() {
  welcome.hidden = true; //방번호 입력창 숨기고
  room.hidden = false; //방 보여주기
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  //메세지 보내는 창
  const msgForm = room.querySelector("#msg");
  msgForm.addEventListener("submit", handleMessageSubmit); //제출버튼 누르면
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = roomForm.querySelector("input");
  //emit : 이벤트+메세지 전송
  socket.emit("enter_room", input.value, showRoom); //인자여러개, 마지막은 함수
  roomName = input.value;
  input.value = "";
}

roomForm.addEventListener("submit", handleRoomSubmit); //방 들어가기 버튼 누르면
nameForm.addEventListener("submit", handleNicknameSubmit); //제출버튼 누르면

socket.on("welcome", (user, newCount) => {
  //방 들어오면
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`; //방 인원 보여주기
  addMessage(`${user} joined!`);
});

socket.on("bye", (left, newCount) => {
  //방 나가면
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`; //방 인원 보여주기
  addMessage(`${left} left!`);
});

socket.on("new_message", (msg) => {
  //메세지 오면
  addMessage(msg);
});

socket.on("room_change", (rooms) => {
  //방 상태 변경시 열린 방 리스트 업데이트
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    //방이 없으면
    return;
  }
  //방리스트 보여주기
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});

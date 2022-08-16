import PropTypes from "prop-types";
import { useState } from "react";

import { Link } from "react-router-dom";


function Home() {
  const [roomName, joinRoom] = useState(""); //방이름 state
  const [userName, joinUser] = useState(""); //유저 state
  const [storedUser, storeUser] = useState(""); //유저 저장state
  const [storedRoom, storeRoom] = useState("");
  //const [client, showClient] = useState("");

  const onUserChange = (event) => joinUser(event.target.value);
  const onUserSubmit = (event) => {  
    event.preventDefault();
    if (userName === "") {
      return;
    }
    storeUser(userName); //입력창 지우기 전, 유저 이름 storedUser 저장함.
    joinUser("");
  }
//==========방 입장 form==========
  const onRoomChange = (event) => joinRoom(event.target.value);
  const onRoomSubmit = (event) => {  
    event.preventDefault();
    if (roomName === "") {
      return;
    }
    storeRoom(roomName); //room 페이지 제목을 바꾸어줌.
    //showClient(storedUser);
    //joinRoom(""); //다시 칸을 비워줌.
  }
  

  return (
    <div>
      <h1>OrchestLive!</h1>
      <div>
        <div className="hiUser">
          <form onSubmit={onUserSubmit}>
            <input 
              onChange={onUserChange}
              value={userName}
              type="text" 
              placeholder="user name"
            />
            <button>Submit user</button>  
          </form>
        </div>
        
        <div className="welcome">
          <form>
            <input 
              onChange={onRoomChange}
              value={roomName}
              type="text" 
              placeholder="room name"
            />
            <Link 
                to={{
                    pathname: "/room",
                    state: {
                        storedRoom,
                        storedUser
                    }
                }}>
                <button onSubmit={onRoomSubmit}>                
                    Enter room
                </button>  
            </Link>
          </form>
        </div>
      </div>
    </div>
    
  );
}


export default Home;
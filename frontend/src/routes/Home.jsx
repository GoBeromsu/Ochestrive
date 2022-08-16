//import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled, {css} from "styled-components";


function HomeTitle() {
  useEffect(() => {
    document.title = 'Home';
  });
}


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
    <HomeLayout>
      <HomeTitle></HomeTitle>
      <Header>
        <div></div>
        <header>OrchestLive!</header>
        <div></div>
      </Header>

      <main>
      
      <Main>
        <div></div>
        <FormLayout>
          
            <form onSubmit={onUserSubmit}>
              <input 
                onChange={onUserChange}
                value={userName}
                class="w3-input"
                type="text" 
                placeholder="user name"
              />
              <div></div>
              <button class="w3-btn w3-border w3-blue-grey">Submit user</button>  
            </form>
          

          
            <form>
              <input 
                onChange={onRoomChange}
                value={roomName}
                class="w3-input" 
                type="text" 
                placeholder="room name"
              />
              <div></div>
              <Link 
                  to={{
                      pathname: "/room",
                      state: {
                          storedRoom,
                          storedUser
                      }
                  }}>
                  <button onSubmit={onRoomSubmit} class="w3-btn w3-border w3-blue-grey">                
                      Enter room
                  </button>  
              </Link>
            </form>
            
        </FormLayout>
        <div></div>
      </Main>
      <div></div>
      </main>


      </HomeLayout>
    
  );
}

const HomeLayout = styled.div`
display: grid;
gap: 50px;
height: 100vh;
weight: 100%;
background: #B0C4DE;

div{
  grid-row: 1/2;
}
header{
  grid-row: 2/3;
  border-style: outset;
  border-radius: 10px;
  border: 4px double #cccccc;
  text-align: center;
  padding-top: 0.5em;
  padding-right: 1em;
  padding-bottom: 2em;
  padding-left: 1em;
  margin: 5px;
  font-size: 20px;
  background-color: white;
  cursor: pointer;
}
div{
  grid-row: 3/4;
}
main{
  grid-row: 4/12;
}
`

const Header = styled.div`
display: flex;
justify-content: space-around;

width: 100%;
height: 30px;
padding: 1em 1em;

`
const Main = styled.div`
display: flex;
justify-content: space-around;
width: 100%;
height: 80%;
font-size: 1em;
`
const FormLayout = styled.div`
display: flex;
flex-direction: column;
justify-content: space-around;
gap : 4vh;
font-size: 20px;
input{

}
`


export default Home;
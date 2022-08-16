import React, {useEffect} from "react";
//import Video from "../components/Video";
//import VideoContainer from "../components/VideoContainer";
import styled, {css} from "styled-components";


function RoomTitle() {
  useEffect(() => {
    document.title = "Room";
  });
}

function Room() {


  return (
    <RoomLayout>
      <header></header>
      <RoomTitle></RoomTitle>
      <main bottom= "0px">
        <Container length={4}>
          <video ></video>
          <video ></video>
          <video ></video>
          <video ></video>
        </Container>
      </main>

      <footer>
        <Footer>
        <div></div>
        <div>
          <Button>
        
            <button className="mute" type="submit" >
              <img src="/microphone.png" height="27px" width="27px"></img></button>
          
            <button className="camera" type="submit" height="30px" width="30px">
              <img src="/microphone.png" height="27px" width="27px"></img></button>
          
            <button className="out" type="submit" height="30px" width="30px">
              <img src="/microphone.png" height="27px" width="27px"></img></button>
          
          </Button>
        </div>
        <div></div>
        </Footer>
      </footer>
    
    </RoomLayout>
  );
  
  
}



const RoomLayout = styled.div`
  display:grid;
  background-color: #696969;
  header{
    height: 10vh;
  }
  main{
    height: 80vh;
    width: 100%;
  }
  footer{
    height: 10vh;
    width: 100%;
    position: fixed;
    bottom: 20px;
  }
  
`

const Container = styled.div`
display: grid;
justify-content: stretch;
align-content: stretch;
grid-template-columns: 1fr 1fr;
background-color: #696969;
margin: 0px;
bottom: 0px;

video{
  width="95%";
}
`

const Footer = styled.div`
display: flex;
justify-content: space-around;
align-items: center;
background-color: #708090;
height: 60px;
`
const Button = styled.div`
display: flex;
gap: 10px;

`

export default Room;

/*<Video key = {myVideo.key} name={myVideo.name} autoPlay></Video>
{
            peerVideos.map((key, name) => (
                console.log(name)
                <Video key={key} name={name} />
            ))
          }*/
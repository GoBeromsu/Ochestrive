import React from "react";
//import Video from "../components/Video";
//import VideoContainer from "../components/VideoContainer";
import styled, {css} from "styled-components";


const Container = styled.div`
display: grid;
grid-template-columns: 1fr 1fr;
`



function Room() {
  //console.log(props);
  // const myVideo = navigator.mediaDevices.getUserMedia({
  //   audio: true,
  //   video: true,
  // });
 
  return (
    <div>
      <h1>OrchestLive!</h1>
      <div className="call">
        <h1>Room Name : </h1>
        <h3>Client : </h3>
        <Container>
          <video></video>
          <video></video>
        </Container>
        

        <button className="mute">Mute</button>
        <button className="camera">Turn Camera Off</button>
        
        <div>
          <button className="out">Remove</button>
        </div>
      </div>
    </div>
  );
  
  
}

export default Room;

/*<Video key = {myVideo.key} name={myVideo.name} autoPlay></Video>
{
            peerVideos.map((key, name) => (
                console.log(name)
                <Video key={key} name={name} />
            ))
          }*/
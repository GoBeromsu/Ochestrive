import styled from "styled-components";
import {useEffect, useRef, useState} from "react";

const Video = ({key}) => {
    // const ref = useRef();
    // useEffect(() => {
    //     if (ref.current) ref.current.srcObject = stream;
    // }, [stream])

    return (
        <>
            <Videobox></Videobox>
        </>
    );
};


const Videobox = styled.video`
  width: 100%;
`
export default Video;
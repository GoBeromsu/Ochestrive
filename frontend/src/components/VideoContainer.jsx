import styled, {css} from "styled-components";
import Video from "./Video";

const VideoContainer = ({streamArray, myStream}) => {
    return (
        <>
            <RayoutContainer>
                <Video stream={myStream} autoPlay></Video>
                {
                    streamArray.map((item, key) => (
                        <Video key={key} stream={item.stream} />
                    ))
                    }
            </RayoutContainer>
        </>
    );
};

const RayoutContainer = styled.div`
    display: grid;
    row-gap: 20px;
    column-gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(20%, auto));
    

    
`
export default VideoContainer;

/*
else if(props.l > 1 && props.l < 4)
            return css`grid-template-columns: repeat(auto-fill, minmax(50%, auto))`*/
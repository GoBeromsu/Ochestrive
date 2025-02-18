# Real-Time Music Collaboration Service Using 5G MEC
- [README for Korean](README-KOR.md)

## Overview Video
[![image](https://user-images.githubusercontent.com/37897508/224617559-bf8693c0-44e6-485c-95f3-c0d066c370c3.png)](https://youtu.be/YgTgkBeZmn4)

## Purpose and Significance of the Idea  
In the post-pandemic era, online video conferencing services such as Zoom and Google Meet are widely used for remote collaboration.  
However, these services are not suitable for music collaboration due to audio latency issues.  

Thus, there is a need for an **online music collaboration service that can be used without latency**.  

By leveraging **5G MEC**, the goal is to provide a stable music collaboration service that is not affected by individual PC performance or network conditions.  
With a service optimized for music collaboration, musicians in bands, musicals, and orchestras can overcome the inconvenience of gathering in one place to perform, enabling the convenience of remote collaboration.

## Development Scope and Features  
- Utilizes **5G networks** to provide sufficient bandwidth and minimizes latency using MEC servers.  
- Implements the **SFU method**, uploading the media server to the MEC server and relaying clients' media streams.  
- Deploys a central server with a web server, database, and TURN server.  
- Uses **MEC servers** to process content at the edge, ensuring real-time performance and reducing latency.  
- Develops a low-latency video conferencing service that allows multiple users to connect simultaneously, based on 5G MEC and SFU media servers.

## Team Roles  
**Go Beomsu**: PM, Backend - WebRTC video chat, refactoring, media stream synchronization, signaling/media server setup, service deployment <a href="https://github.com/GoBeromsu">@GoBeromsu</a>  
**Kim Myeongji**: Backend - WebRTC video chat, controller implementation, refactoring, Docker environment setup <a href="https://github.com/Starlight258">@Starlight258</a>  
**Kim Jimin**: Frontend - Web development, Docker environment setup <a href="https://github.com/kimjimin00">@kimjimin00</a>  
**Ryu Hanil**: Backend - Media device I/O processing, synchronization algorithm implementation <a href="https://github.com/cooopang">@cooopang</a>  

## Development Outcomes  
- Successfully developed a **low-latency music collaboration service using a 5G MEC server**.  
- Built a **real-time online collaboration application based on WebRTC with NodeJS**.  
- Placed the web server, database, and TURN server on a central server while deploying the media server on MEC to **process content at the edge**, enhancing real-time performance and reducing latency.  
- The MEC media server operates in a **Docker container environment**, allowing lightweight service deployment and mobility.  
- In the **5G MEC test environment**, latency was measured at **2ms for four users**, enabling high-quality, low-latency collaboration, proving an improvement over existing services.  

In conclusion, the service provides **a stable music collaboration platform that is independent of individual PC performance and network conditions using 5G MEC**.  

## Preview  
![image](https://user-images.githubusercontent.com/78211281/224594008-192069d5-a996-4e74-89a1-36f8d2318bbb.png)

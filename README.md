# Ochestrive

- Babel download
  - npm i @babel/core @babel/cli @babel/node -D
- package.json의 scripts
  - //nodemon 호출되면 nodemon.js를 살펴보고 nodemon 실행
- nodemon은 sever.js 를 수정할 때만 새로 고침하도록 하고 싶음
  - 우리 프로젝트를 살펴보고 서버를 재시작해주는 것임
  - 우리가 한 파일을 javascript로 컴파일 해준다

- Web socket
  - 악수하는 것처럼 서버와 유저는 연결된다
  - 서버는 request를 더 이상 기다리지 않고 유저에게 데이터를 보내고 받을 수 있다
  - 유저와 서버를 양방향 연결을 한다
- what is http
  - http는 모든 서버에서 작동하는 방식이다
  - 유저가 requset를 보내면 서버가 반응하는 구조
  - stateless : backend가 유저를 기억하지 못한다
  - 유저와 backend는 분리 되어 있어 데이터를 주고 받고 백엔드는 유저를 잊어버린다
  - real time은 아님 - 서버가 능동적으로 데이터를 줄 수도 없고 대기를 해야한다.
- 서버에게 쿠키를 보내면 서버는 유저에게 쿠키에 알맞은 응답을 하고 잊어버린다

- ws를 사용할 것이다
  - express는 http이므로 둘의 프로토콜은 다르다
  - express는 ws를 지원하지 않는다
# 1. node 이미지 사용
FROM   node:16.15.0-alpine

RUN set -eux; apk add --no-cache curl;
# 2. 패키지 우선 복사
COPY    ./package* .
WORKDIR /usr/src/app


RUN     npm install
RUN     npm install mysql

# 3. 소스 복사
COPY . .

# 4. WEB 서버 실행 (Listen 포트 정의)
EXPOSE 8080
CMD node server.js


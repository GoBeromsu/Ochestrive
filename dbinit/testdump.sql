CREATE TABLE user(
       no INT PRIMARY KEY AUTO_INCREMENT, 
       username VARCHAR(60), 
       room INT
);
INSERT INTO user(
       username, 
       room) 
VALUES(
       "Shubham verma", 
        21
);

ALTER USER 'root' IDENTIFIED WITH mysql_native_password BY '1234'; 
flush privileges;
DROP DATABASE IF EXISTS orchestrive;
CREATE DATABASE orchestrive CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE orchestrive;

CREATE TABLE user (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(32) DEFAULT NULL,
    room INT(11) DEFAULT NULL,
    PRIMARY KEY(id)
);
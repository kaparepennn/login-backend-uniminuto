CREATE DATABASE IF NOT EXISTS login_backend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE login_backend;
CREATE TABLE IF NOT EXISTS usuarios (username VARCHAR(50) NOT NULL, password VARCHAR(100) NOT NULL);
INSERT INTO usuarios (username,password) VALUES ('usuario1','12345'),('estudiante','2026'),('admin','admin123');

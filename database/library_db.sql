-- ============================================================
-- Library Management System - Database setup
-- Run this in MySQL Workbench, or from a terminal:
--
--   mysql -u root -p < database/library_db.sql
--
-- The Spring Boot application can also create the database and
-- table automatically, so this script is optional but useful
-- for documentation / college submission.
-- ============================================================

CREATE DATABASE IF NOT EXISTS library_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE library_db;

CREATE TABLE IF NOT EXISTS books (
    id       BIGINT       NOT NULL AUTO_INCREMENT,
    title    VARCHAR(150) NOT NULL,
    author   VARCHAR(100) NOT NULL,
    category VARCHAR(80)  NOT NULL,
    quantity INT          NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS students (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    student_id VARCHAR(30)  NOT NULL,
    name       VARCHAR(100) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_students_student_id (student_id)
);

CREATE TABLE IF NOT EXISTS issue_transactions (
    id          BIGINT NOT NULL AUTO_INCREMENT,
    book_id     BIGINT NOT NULL,
    student_id  BIGINT NOT NULL,
    issue_date  DATE   NOT NULL,
    due_date    DATE   NOT NULL,
    return_date DATE   NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_issue_transactions_book
        FOREIGN KEY (book_id) REFERENCES books (id),
    CONSTRAINT fk_issue_transactions_student
        FOREIGN KEY (student_id) REFERENCES students (id)
);

-- Optional sample data (safe to skip)
INSERT INTO books (title, author, category, quantity)
SELECT 'Effective Java', 'Joshua Bloch', 'Programming', 5
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title = 'Effective Java');

INSERT INTO books (title, author, category, quantity)
SELECT 'Clean Code', 'Robert C. Martin', 'Programming', 3
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title = 'Clean Code');

INSERT INTO books (title, author, category, quantity)
SELECT 'The Alchemist', 'Paulo Coelho', 'Fiction', 8
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title = 'The Alchemist');

INSERT INTO books (title, author, category, quantity)
SELECT 'Wings of Fire', 'A. P. J. Abdul Kalam', 'Biography', 4
WHERE NOT EXISTS (SELECT 1 FROM books WHERE title = 'Wings of Fire');

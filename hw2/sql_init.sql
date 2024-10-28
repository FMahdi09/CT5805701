-- inital database creation
DROP DATABASE IF EXISTS GearHub;

CREATE DATABASE GearHub;
USE GearHub;

-- create role table
CREATE TABLE roles (
	id int NOT NULL,
	name varchar(255) NOT NULL,
	CONSTRAINT pk_roles PRIMARY KEY(id)
);

-- populate roles table with inital values
INSERT INTO roles (
	id, name
) VALUES 
	(0, "admin"),
	(1, "user")
;

-- create user table
CREATE TABLE users (
	id int NOT NULL,
	first_name varchar(255) NOT NULL,
	last_name varchar(255) NOT NULL,
	username varchar(255) NOT NULL DEFAULT (concat(first_name, "_", last_name)),
	password varchar(255) NOT NULL DEFAULT ("changeMe!"),
	email varchar(255) NOT NULL,
	fk_role_id int NOT NULL DEFAULT 1,
	CONSTRAINT pk_users PRIMARY KEY(id),
	CONSTRAINT fk_users_roles FOREIGN KEY(fk_role_id) REFERENCES roles(id)
);

-- now load user data from ./data/users.csv

-- create contract_type table
CREATE TABLE contract_type (
	id int NOT NULL,
	name varchar(255) NOT NULL,
	CONSTRAINT pk_contract_type PRIMARY KEY(id)
);

-- populate contract_type table with inital values
INSERT INTO contract_type (
	id, name
) VALUES 
	(0, "rental"),
	(1, "purchase"),
	(2, "service")
;

-- create product_type table
CREATE TABLE product_type (
	id int NOT NULL,
	name varchar(255) NOT NULL,
	CONSTRAINT pk_product_type PRIMARY KEY(id)
);

-- now load product_types from ./data/categories.csv (IMPORTANT: delimiter = $)

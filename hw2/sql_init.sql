-- create db GearHub and import all tables in ./data/ manually
-- helpers: \(.*€ \)\{8\}
USE GearHub;

-- drop tables
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS listings;
DROP TABLE IF EXISTS contract_type;
DROP TABLE IF EXISTS product_type;
DROP TABLE IF EXISTS location;

-- create role table
CREATE TABLE roles (
	id int NOT NULL AUTO_INCREMENT,
	name varchar(255) NOT NULL,
	CONSTRAINT pk_roles PRIMARY KEY(id)
);

-- populate roles table with inital values
INSERT INTO roles (
	name
) VALUES 
	("admin"),
	("user")
;

-- create user table
CREATE TABLE users (
	id int NOT NULL AUTO_INCREMENT,
	first_name varchar(255) NOT NULL,
	last_name varchar(255) NOT NULL,
	username varchar(255) NOT NULL DEFAULT (concat(first_name, "_", last_name)),
	password varchar(255) NOT NULL DEFAULT ("changeMe!"),
	email varchar(255) NOT NULL,
	fk_role_id int NOT NULL DEFAULT 2,
	CONSTRAINT pk_users PRIMARY KEY(id),
	CONSTRAINT fk_users_roles FOREIGN KEY(fk_role_id) REFERENCES roles(id)
);

-- populate users table from given data
INSERT INTO users (
	id, first_name, last_name, email
)
SELECT *
FROM users_data
ON DUPLICATE KEY
UPDATE first_name = first_name, last_name = last_name, email = email;

-- create contract_type table
CREATE TABLE contract_type (
	id int NOT NULL AUTO_INCREMENT,
	name varchar(255) NOT NULL,
	CONSTRAINT pk_contract_type PRIMARY KEY(id)
);

-- populate contract_type table with inital values
INSERT INTO contract_type (
	name
) VALUES 
	("rental"),
	("purchase"),
	("service")
;

-- create product_type table
CREATE TABLE product_type (
	id int NOT NULL AUTO_INCREMENT,
	name varchar(255) NOT NULL,
	CONSTRAINT pk_product_type PRIMARY KEY(id)
);

-- populate product_type table from given data
INSERT INTO product_type (
	id, name
)
SELECT *
FROM categories_data
ON DUPLICATE KEY
UPDATE name = name;

-- create location table
CREATE TABLE location (
	id int NOT NULL AUTO_INCREMENT,
	country varchar(255) NOT NULL,
	state varchar(255) NOT NULL,
	CONSTRAINT pk_product_type PRIMARY KEY(id)
);

-- populate product_type table from given data
INSERT INTO location (
	country, state
)
SELECT DISTINCT ` country`, ` location`
FROM products_data;

-- create listings table
CREATE TABLE listings (
	id int NOT NULL AUTO_INCREMENT,
	title varchar(511) NOT NULL,
	price int NOT NULL,
	fk_product_id int NOT NULL,
	fk_contract_id int NOT NULL DEFAULT 2,
	fk_location_id int NOT NULL,
	CONSTRAINT pk_listing PRIMARY KEY(id),
	CONSTRAINT fk_product_type FOREIGN KEY(fk_product_id) REFERENCES product_type(id),
	CONSTRAINT fk_location_type FOREIGN KEY(fk_contract_id) REFERENCES contract_type(id),
	CONSTRAINT fk_location FOREIGN KEY(fk_location_id) REFERENCES location(id)
);

-- populate product_type table from given data
INSERT INTO listings (
	id, title, price, fk_product_id, fk_location_id
)
SELECT
	`product_id`,
	` title`,
	` price`,
	` category_id`,
	location.id
FROM products_data
JOIN product_type ON products_data.` category_id` = product_type.id
JOIN location ON location.country = products_data.` country`
			 AND location.state = products_data.` location`
WHERE `product_id` != 0
ON DUPLICATE KEY
UPDATE title = title;

-- create orders table
CREATE TABLE orders (
	id int NOT NULL AUTO_INCREMENT,
	status varchar(255) NOT NULL,
	fk_listing_id int NOT NULL,
	fk_seller_id int NOT NULL,
	fk_buyer_id int NULL,
	CONSTRAINT pk_product_type PRIMARY KEY(id),
	CONSTRAINT fk_listing FOREIGN KEY(fk_listing_id) REFERENCES listings(id),
	CONSTRAINT fk_users_seller FOREIGN KEY(fk_seller_id) REFERENCES users(id),
	CONSTRAINT fk_users_buyer FOREIGN KEY(fk_buyer_id) REFERENCES users(id)
);

-- buyer id is 0 by default when empty (instead of NULL) lets change that
UPDATE orders_data
	SET ` buyer_id` = NULL
	WHERE ` buyer_id` = 0;

-- populate product_type table from given data
INSERT INTO orders (
	id, status, fk_listing_id, fk_seller_id, fk_buyer_id
)
SELECT
	`transaction_id`,
	` status`,
	` product_id`,
	` seller_id`,
	` buyer_id`
FROM orders_data
JOIN users as sellers ON sellers.id = orders_data.` seller_id`
JOIN users as buyers ON buyers.id = orders_data.` buyer_id`
JOIN listings ON listings.id = orders_data.` product_id`
ON DUPLICATE KEY
UPDATE status = status;

-- add orders without a buyer
INSERT INTO orders (
	id, status, fk_listing_id, fk_seller_id, fk_buyer_id
)
SELECT
	`transaction_id`,
	` status`,
	` product_id`,
	` seller_id`,
	` buyer_id`
FROM orders_data
JOIN users as sellers ON sellers.id = orders_data.` seller_id`
JOIN listings ON listings.id = orders_data.` product_id`
WHERE ` buyer_id` IS NULL
ON DUPLICATE KEY
UPDATE status = status;


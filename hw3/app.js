const express = require('express');
const db = require('mysql2');
const cookieParser = require('cookie-parser')
const session = require('express-session')

const app = express();

app.set('view engine', 'hjs');
app.use(cookieParser('secretingredient'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
	secret: "mySecret",
	resave: false,
	saveUninitialized: true,
	name: "notTheDefaultName"
}))


const configs = require('./config');

const connection = db.createConnection(configs.db);
connection.connect((err) => {
	if (err) {
		console.log("Error connecting to database: ", err);
		process.exit();
	}
	else {
		console.log("Connected to database");
	}
});

app.get('/', (req, res) => {
	if (req.get("HX-Request")) {
		res.send(
			'<div class="text-center">' +
			'<i class="bi bi-cup-hot" style="font-size: 50vh;"></i>' +
			'</div>'
		);
	}
	else {
		res.render('layout', {
			title: 'Welcome to GearHub',
			partials: {
				navbar: 'navbar',
			},
			loggedIn: req.session.loggedIn,
			admin: req.session.admin,
			id: req.session.userid,
			loginMessage: req.cookies.loginMessage,
			registerMessage: req.cookies.registerMessage
		});
	}
});

app.post('/login', function(req, res, next) {
	let SQL = "SELECT users.id as id, roles.name as role FROM users JOIN roles ON users.fk_role_id=roles.id WHERE username = ? AND password = ?";

	connection.execute(SQL, [req.body.username, req.body.password], function(err, data) {
		if (err) {
			console.log("Database Error: ", err);
			res.status(404).send(err.sqlMessage);
		}
		else {
			if (data[0]) {
				req.session.loggedIn = true;
				req.session.userid = data[0].id;

				if (data[0].role === "admin") {
					req.session.admin = true;
				}
				else if (data[0].role === "user") {
					req.session.user = true;
				}
				res.clearCookie("loginMessage")
			}
			else {
				res.cookie("loginMessage", "invalid credentials")
			}

			res.redirect("/")
		}
	});
});

app.post('/register', function(req, res, next) {
	let SQL = "SELECT * FROM users WHERE username = ?";

	connection.execute(SQL, [req.body.username], function(err, data) {
		if (err) {
			console.log("Database Error: ", err);
			res.status(404).send(err.sqlMessage);
		}
		else {
			if (data[0]) {
				res.cookie("registerMessage", "Username already exists")

				res.redirect("/")
			}
		}
	});

	res.clearCookie("registerMessage")

	SQL = "INSERT INTO users (first_name, last_name, username, password, email) VALUES (?, ?, ?, ?, ?)";

	connection.execute(SQL, [req.body.firstname, req.body.lastname, req.body.username, req.body.password, req.body.email], function(err, data) {
		if (err) {
			console.log("Database Error: ", err);
			res.status(404).send(err.sqlMessage);
		}
		else {
			res.cookie("registerMessage", "Register successfull, please log in")

			res.redirect("/")
		}

	});
})

app.post('/logout', function(req, res, next) {
	req.session.destroy();

	res.clearCookie("registerMessage")
	res.clearCookie("loginMessage")
	res.redirect("/")
})

const locations = require('./routes/locations');
locations.connection = connection;
app.use('/locations', locations);

const roles = require('./routes/roles');
roles.connection = connection;
app.use('/roles', roles);

const contracts = require('./routes/contracts');
contracts.connection = connection;
app.use('/contracts', contracts);

const products = require('./routes/products');
products.connection = connection;
app.use('/products', products);

const users = require('./routes/users');
users.connection = connection;
app.use('/users', users);

const listings = require('./routes/listings');
listings.connection = connection;
app.use('/listings', listings);

app.listen(8081, function() {
	console.log('Web server listening on port 8081!');
});

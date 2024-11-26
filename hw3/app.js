const express = require('express');
const db = require('mysql2');
const cookieParser = require('cookie-parser')

const app = express();

app.set('view engine', 'hjs');
app.use(cookieParser('secretingredient'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));


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
			loggedIn: req.cookies.loggedIn,
			admin: req.cookies.admin,
			id: req.cookies.id,
			loginMessage: req.cookies.loginMessage
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
				res.cookie("loggedIn", true)
				res.cookie(data[0].role, true)
				res.cookie("id", data[0].id)
				res.clearCookie("loginMessage")
			}
			else {
				res.cookie("loginMessage", "invalid credentials")
			}

			res.redirect("/")
		}
	});
});

app.post('/logout', function(req, res, next) {
	res.clearCookie("loggedIn")
	res.clearCookie("admin")
	res.clearCookie("user")
	res.clearCookie("id")

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

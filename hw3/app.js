const express = require('express');
const db = require('mysql2');
const app = express();

app.set('view engine', 'hjs');
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
			}
		});
	}
});

app.get('/*', function(req, res, next) {
	if (req.get("HX-Request")) {
		next();
	}
	else {
		res.render('layout', {
			title: 'Welcome to McDonald e-management',
			partials: {
				navbar: 'navbar',
			},
			where: req.url
		});
	}
});

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

app.listen(8081, function() {
	console.log('Web server listening on port 8081!');
});

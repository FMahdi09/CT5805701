const express = require('express');
const app = express.Router();

function doSQL(SQL, parms, res, callback) {
	app.connection.execute(SQL, parms, function(err, data) {
		if (err) {
			console.log(err);
			res.status(404).send(err.sqlMessage);
		}
		else {
			callback(data);
		}
	});
}

app.get(['/', '/index'], function(req, res) {
	let SQL = "SELECT id, name FROM roles";
	doSQL(SQL, [], res, function(data) {
		res.render('users/index', {
			roles: data,
		});
	});
});

app.get("/typedList", function(req, res) {
	let SQL = "SELECT id, first_name, last_name, username, email FROM users WHERE fk_role_id = ?";
	doSQL(SQL, [req.query.roleId], res, function(data) {
		res.render('users/list', {
			users: data,
			partials: { listrow: 'users/listrow' }
		});
	});
});

app.delete('/:ID', function(req, res) {
	let SQL = "DELETE FROM users WHERE ID=?";
	doSQL(SQL, [req.params.ID], res, function(data) {
		res.send("");
	});
});

app.get('/add', function(req, res) {
	let SQL = "SELECT id, name FROM roles";
	doSQL(SQL, [], res, function(data) {
		res.render('users/add', {
			roles: data,
		});
	});
});

app.post('/', function(req, res) {
	let SQL = "INSERT INTO users (fk_role_id, first_name, last_name, email, username, password) VALUES (?, ?, ?, ?, ?, ?)";
	doSQL(SQL, [req.body.roleId, req.body.first_name, req.body.last_name, req.body.email ,req.body.username ,req.body.password], res, function(data) {
		res.send(`User ${req.body.username} added with id ${data.insertId}`);
	});
});

app.get("/:ID", function(req, res) {
	let SQL = "SELECT first_name, last_name, username, email FROM users WHERE id = ?";
	app.connection.execute(SQL, [req.params.ID], function(err, data) {
		if (err) {
			console.log("Error fetching data: ", err);
			res.status(404).send(err.sqlMessage);
		}
		else {
			res.render('users/edit', {
				ID: req.params.ID,
				first_name: data[0].first_name,
				last_name: data[0].last_name,
				username: data[0].username,
				email: data[0].email,
			});
		}
	});
});

app.put("/:ID", function(req, res) {
	let showRow = function() {
		let SQL = "SELECT ID, first_name, last_name, username, email FROM users WHERE id = ?";
		app.connection.execute(SQL, [req.params.ID], function(err, data) {
			if (err) {
				console.log("Error fetching data: ", err);
				res.status(404).send(err.sqlMessage);
			}
			else {
				res.render('users/listrow', {
					id: req.params.ID,
					first_name: data[0].first_name,
					last_name: data[0].last_name,
					username: data[0].username,
					email: data[0].email,
				});
			}
		});
	};
	if (req.body.action == "update") {
		let SQL = "UPDATE users SET first_name = ?, last_name = ?, username = ?, email = ? WHERE ID = ?";
		const first_name = req.body.first_name;
		const last_name = req.body.last_name;
		const username = req.body.username;
		const email = req.body.email;
		const ID = req.params.ID;
		app.connection.execute(SQL, [first_name, last_name, username, email, ID], function(err, data) {
			if (err) {
				console.log("Error updating data: ", err);
				res.status(404).send(err.sqlMessage);
			}
			else {
				showRow();
			}
		});
	}
	else {
		showRow();
	}
});

module.exports = app;

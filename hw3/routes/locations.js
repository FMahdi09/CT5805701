const express = require('express');
const app = express.Router();

app.get('/', function(req, res) {
	let SQL = "SELECT id as ID, country, state FROM location ORDER BY ID ASC";
	app.connection.query(SQL, function(err, data) {
		if (err) {
			console.log("Error fetching data: ", err);
			res.status(404).send(err.sqlMessage);
		}
		else {
			res.render('locations/index', {
				data: data,
				partials: {
					row: 'locations/row',
				}
			});
		}
	});
});

app.post("/", function(req, res) {
	let SQL = "INSERT INTO location (country, state) VALUES (?, ?)";
	app.connection.execute(SQL, [req.body.country, req.body.state], function(err, data) {
		if (err) {
			console.log("Error adding data: ", err);
			res.status(404).send(err.sqlMessage);
		}
		else {
			res.render('locations/row', {
				ID: data.insertId,
				country: req.body.country,
				state: req.body.state,
			});
		}
	});
});

app.delete("/:id", function(req, res) {
	let SQL = "DELETE FROM location WHERE id = ?";
	app.connection.execute(SQL, [req.params.id], function(err, data) {
		if (err) {
			console.log("Error deleting data: ", err);
			res.status(404).send(err.sqlMessage);
		}
		else {
			res.send("");
		}
	});
});

app.get("/:id", function(req, res) {
	let SQL = "SELECT country, state FROM location WHERE ID = ?";
	app.connection.execute(SQL, [req.params.id], function(err, data) {
		if (err) {
			console.log("Error fetching data: ", err);
			res.status(404).send(err.sqlMessage);
		}
		else {
			res.render('locations/edit', {
				ID: req.params.id,
				country: data[0].country,
				state: data[0].state,
			});
		}
	});
});

app.put("/:id", function(req, res) {
	let showRow = function() {
		let SQL = "SELECT id, state, country FROM location WHERE ID = ?";
		app.connection.execute(SQL, [req.params.id], function(err, data) {
			if (err) {
				console.log("Error fetching data: ", err);
				res.status(404).send(err.sqlMessage);
			}
			else {
				res.render('locations/row', {
					ID: data[0].id,
					country: data[0].country,
					state: data[0].state,
				});
			}
		});
	};
	if (req.body.action == "update") {
		let SQL = "UPDATE location SET country = ?, state = ? WHERE ID = ?";
		const country = req.body.country;
		const state = req.body.state;
		const id = req.params.id;
		app.connection.execute(SQL, [country, state, id], function(err, data) {
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

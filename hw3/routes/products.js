const express = require('express');
const app = express.Router();

app.get('/', function(req, res) {
	let SQL = "SELECT id as ID, name FROM product_type ORDER BY ID ASC";
	app.connection.query(SQL, function(err, data) {
		if (err) {
			console.log("Error fetching data: ", err);
			res.status(404).send(err.sqlMessage);
		}
		else {
			res.render('products/index', {
				data: data,
				partials: {
					row: 'products/row',
				}
			});
		}
	});
});

app.post("/", function(req, res) {
	let SQL = "INSERT INTO product_type (name) VALUES (?)";
	app.connection.execute(SQL, [req.body.name], function(err, data) {
		if (err) {
			console.log("Error adding data: ", err);
			res.status(404).send(err.sqlMessage);
		}
		else {
			res.render('products/row', {
				ID: data.insertId,
				name: req.body.name,
			});
		}
	});
});

app.delete("/:id", function(req, res) {
	let SQL = "DELETE FROM product_type WHERE id = ?";
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
	let SQL = "SELECT name FROM product_type WHERE ID = ?";
	app.connection.execute(SQL, [req.params.id], function(err, data) {
		if (err) {
			console.log("Error fetching data: ", err);
			res.status(404).send(err.sqlMessage);
		}
		else {
			res.render('products/edit', {
				ID: req.params.id,
				name: data[0].name,
			});
		}
	});
});

app.put("/:id", function(req, res) {
	let showRow = function() {
		let SQL = "SELECT id, name FROM product_type WHERE ID = ?";
		app.connection.execute(SQL, [req.params.id], function(err, data) {
			if (err) {
				console.log("Error fetching data: ", err);
				res.status(404).send(err.sqlMessage);
			}
			else {
				res.render('products/row', {
					ID: data[0].id,
					name: data[0].name,
				});
			}
		});
	};
	if (req.body.action == "update") {
		let SQL = "UPDATE product_type SET name = ? WHERE ID = ?";
		const name = req.body.name;
		const id = req.params.id;
		app.connection.execute(SQL, [name, id], function(err, data) {
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
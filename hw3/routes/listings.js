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
	let SQL = "SELECT id, name FROM contract_type";
	let SQL1 = "SELECT id, name FROM product_type";
	let SQL2 = "SELECT id, state FROM location";
	doSQL(SQL, [], res, function(data) {
		let contracts = data;
		doSQL(SQL1, [], res, function(data) {
			let products = data;
			doSQL(SQL2, [], res, function(data) {
				res.render('listings/index', {
					contracts: contracts,
					products: products,
					locations: data,
				});
			});
		});
	});
});

app.get("/search", function(req, res) {
	let SQL = "SELECT users.username as seller , listings.id, title, price FROM listings " +
		"JOIN orders ON listings.id=orders.fk_listing_id " +
		"JOIN users ON orders.fk_seller_id=users.id " +
		"WHERE fk_product_id = ? AND fk_contract_id = ? AND fk_location_id = ? AND title LIKE ? AND fk_buyer_id IS NULL ";
	doSQL(SQL, [req.query.productId, req.query.contractId, req.query.locationId, "%" + req.query.searchquery + "%"], res, function(data) {
		res.render('listings/list', {
			listings: data,
			partials: { listrow: 'listings/listrow' },
			admin: req.cookies.admin
		});
	});
});

app.get('/add', function(req, res) {
	let SQL = "SELECT id, name FROM contract_type";
	let SQL1 = "SELECT id, name FROM product_type";
	let SQL2 = "SELECT id, state FROM location";
	doSQL(SQL, [], res, function(data) {
		let contracts = data;
		doSQL(SQL1, [], res, function(data) {
			let products = data;
			doSQL(SQL2, [], res, function(data) {
				res.render('listings/add', {
					contracts: contracts,
					products: products,
					locations: data
				});
			});
		});
	});
});

app.post('/', function(req, res) {
	let SQL = "INSERT INTO listings (title, price, fk_product_id, fk_contract_id, fk_location_id) VALUES (?, ?, ?, ?, ?)";
	let SQL1 = "INSERT INTO orders (status, fk_listing_id, fk_seller_id) VALUES('open', ?, ?)";
	doSQL(SQL, [req.body.title, req.body.price, req.body.productId, req.body.contractId, req.body.locationId], res, function(data) {
		let listingId = data.insertId;
		doSQL(SQL1, [listingId, req.cookies.id], res, function(data) {
			res.send(`Listing ${req.body.title} added with id ${listingId}`);
		});
	});
});

app.delete('/:id', function(req, res) {
	let SQL = "DELETE listings FROM listings LEFT JOIN orders ON listings.id=orders.fk_listing_id WHERE orders.id IS NULL";
	let SQL1 = "DELETE orders FROM orders " +
		"JOIN users ON orders.fk_seller_id=users.id " +
		"WHERE fk_listing_id=? AND username=?";
	doSQL(SQL1, [req.params.id, req.query.seller], res, function(data) {
		doSQL(SQL, [req.params.id], res, function(data) {
			res.send("");
		});
	});
});

app.put("/:ID", function(req, res) {
	let showRow = function() {
		let SQL = "SELECT users.username as seller , listings.id as id, title, price FROM listings " +
			"JOIN orders ON listings.id=orders.fk_listing_id " +
			"JOIN users ON orders.fk_seller_id=users.id WHERE listings.id = ?";

		app.connection.execute(SQL, [req.params.ID], function(err, data) {
			if (err) {
				console.log("Error fetching data: ", err);
				res.status(404).send(err.sqlMessage);
			}
			else {
				res.render('listings/listrow', {
					id: req.params.ID,
					title: data[0].title,
					price: data[0].price,
					seller: data[0].seller,
					admin: req.cookies.admin
				});
			}
		});
	};
	if (req.body.action == "update") {
		let SQL = "UPDATE listings SET title = ?, price = ? WHERE id = ?";
		const title = req.body.title;
		const price = req.body.price;
		const ID = req.params.ID;
		app.connection.execute(SQL, [title, price, ID], function(err, data) {
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

app.get("/:ID", function(req, res) {
	let SQL = "SELECT users.username as seller , listings.id as id, title, price FROM listings " +
		"JOIN orders ON listings.id=orders.fk_listing_id " +
		"JOIN users ON orders.fk_seller_id=users.id WHERE listings.id = ?";

	app.connection.execute(SQL, [req.params.ID], function(err, data) {
		if (err) {
			console.log("Error fetching data: ", err);
			res.status(404).send(err.sqlMessage);
		}
		else {
			res.render('listings/edit', {
				ID: req.params.ID,
				title: data[0].title,
				price: data[0].price,
				seller: data[0].seller,
			});
		}
	});
});




module.exports = app;

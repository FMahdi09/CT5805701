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
			partials: { listrow: 'listings/listrow' }
		});
	});
});

app.get('/add', function(req, res) {
	let SQL = "SELECT id, name FROM contract_type";
	let SQL1 = "SELECT id, name FROM product_type";
	let SQL2 = "SELECT id, state FROM location";
	let SQL3 = "SELECT id, username FROM users";
	doSQL(SQL, [], res, function(data) {
		let contracts = data;
		doSQL(SQL1, [], res, function(data) {
			let products = data;
			doSQL(SQL2, [], res, function(data) {
				let locations = data;
				doSQL(SQL3, [], res, function(data) {
					res.render('listings/add', {
						contracts: contracts,
						products: products,
						locations: locations,
						users: data
					});
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
		doSQL(SQL1, [listingId, req.body.userId], res, function(data) {
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


module.exports = app;

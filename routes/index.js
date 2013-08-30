
var mongojs = require('mongojs');
var db = mongojs('masterofcoin', ['events']);

/*
 * GET /
 */

exports.index = function(req, res) {
	db.events.find().limit(20).sort({_id:-1}, function(err, events) {
		events = events.map(function(event) {
			return JSON.stringify(event);
		});
		
		res.render('index', {title: 'Master of Coin', events: events});
	});
};

/*
 * POST /
 */

exports.post = function(req, res) {
	db.events.insert(req.body);
	res.send();
};

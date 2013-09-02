/**
 * Config
 */

var nconf = require('nconf');
nconf.file('config.json');

/**
 * Dependencies.
 */

var mongojs = require('mongojs');
var db = mongojs('masterofcoin', ['events']);

var hljs = require('highlight.js');
var Hipchat = require('node-hipchat');

var hipchat = new Hipchat(nconf.get('hipchat'));

/*
 * GET /
 */

exports.index = function(req, res) {
	db.events.find().limit(20).sort({_id:-1}, function(err, events) {
		items = events.map(function(event) {
			var json = JSON.stringify(event, null, 4);
			return hljs.highlight('json', json).value;
		});
		
		res.render('index', {title: 'Master of Coin', items: items});
	});
};

/*
 * POST /
 */

exports.post = function(req, res) {
	db.events.insert(req.body);
	
	// Send to Hipchat:
	var room = (req.body.livemode) ? 'Pulse' : 'Pulse-dev';
	hipchat.postMessage({room: room, from: 'Stripe', message: req.body.type, color: 'purple', notify: 1});
	
	res.send();
};

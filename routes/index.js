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

/**
 * Shared variables.
 */

var openConnections = [];

var formatEvent = function(event) {
	var json = JSON.stringify(event, null, 4);
	event.pretty = hljs.highlight('json', json).value;
	event.date = event._id.getTimestamp().toString();
	return event;
}


/*
 * POST /
 */

exports.post = function(req, res) {
	var e = req.body;
	db.events.insert(e);
	
	// Send to Hipchat:
	var room = (e.livemode) ? 'Pulse' : 'Pulse-dev';
	var message = (e.type === 'charge.succeeded') 
		? [e.type, e.data.object.currency + e.data.object.amount.toString(), e.data.object.metadata.slug].join(' - ') 
		: e.type;
	hipchat.postMessage({room: room, from: 'Stripe', message: message, color: 'purple', notify: 1});
	
	var event = formatEvent(e);
	openConnections.forEach(function(resp) {
		var d = new Date();
		resp.write('id: ' + d.getMilliseconds() + '\n');
		resp.write('data:' + JSON.stringify(event) +   '\n\n');
	});
	
	res.send();
};


/*
 * GET /
 */

exports.index = function(req, res) {
	db.events.find().limit(20).sort({_id:-1}, function(err, events) {
		events.forEach(formatEvent);
		
		res.render('index', {title: 'Master of Coin', events: events});
	});
};


/*
 * GET /stream
 */


exports.stream = function(req, res) {
	
	// set timeout as high as possible
	req.socket.setTimeout(Infinity);
	
	// send headers for event-stream connection
	// see spec for more information
	res.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive'
	});
	res.write('\n');
	
	// push this res object to our global variable
	openConnections.push(res);
	
	// When the request is closed, e.g. the browser window
	// is closed. We search through the open connections
	// array and remove this connection.
	req.on('close', function() {
		var toRemove;
		for (var j = 0 ; j < openConnections.length ; j++) {
			if (openConnections[j] == res) {
				toRemove = j;
				break;
			}
		}
		openConnections.splice(j, 1);
	});
};

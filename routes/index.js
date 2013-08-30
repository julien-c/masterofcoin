
var mongojs = require('mongojs');
var db = mongojs('masterofcoin', ['events']);

/*
 * GET /
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

/*
 * POST /
 */

exports.post = function(req, res) {
	db.events.insert(req.body);
	res.send();
};

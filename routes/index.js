
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
	console.log(req.body);
};

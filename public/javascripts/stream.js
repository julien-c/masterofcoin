
// @see  http://www.html5rocks.com/en/tutorials/eventsource/basics/
// @see  http://css.dzone.com/articles/html5-server-sent-events


var source = new EventSource('/stream');

source.addEventListener('open', function(e) {
	console.log('Connection open');
}, false);

source.addEventListener('message', function(e) {
	var event = JSON.parse(e.data);
	console.log(event);
	
	$('body').prepend('<div><h3>' + event.date + '</h3><pre><code>' + event.pretty + '</code></pre></div>');
}, false);


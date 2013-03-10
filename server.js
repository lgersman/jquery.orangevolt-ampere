var express = require('express');

var app = express();

	/* the jquery.upload example requires an upload endpoint */
app.use( express.bodyParser());
app.post( '/upload', function( req, res) {
	if( req.files.toupload) {		
		var retval = { 
			path : req.files.toupload.path,
			name : req.files.toupload.name,
			type : req.files.toupload.type
		};
		res.send( retval);
	} else {
		res.send( 500, { error: 'something blew up' });
	}	
});

app.use( '/public/examples', express.static(__dirname + '/public/examples'));
app.use( '/libs', express.static(__dirname + '/libs'));
app.use( '/src', express.static(__dirname + '/src'));
app.use( '/test', express.static(__dirname + '/test'));
app.use( '/dist', express.static(__dirname + '/dist'));
/*
app.get( '/', function( req, res) {
	var fs = require( 'fs'), path = require( 'path');
	res.send(
		fs.readdirSync( __dirname + '/public/examples').map( function( item) {
			return '<p><a href="/public/examples/' + path.basename( item) + '/index.html">' + path.basename( item) + '</a></p>';
		}).join( '')
	);
});
*/
app.use( '/public/examples', express.directory( __dirname + '/public/examples'));
app.get( '/', function( req, res) {
	res.redirect( '/public/examples');
});

var port = process.env.VCAP_APP_PORT || 8090;
app.listen( port);
console.log('\n  listening on port ' + port + '\n');

	// assume unix/linux
//require('child_process').exec('xdg-open http://localhost:8090/', function( error, stdout, stderr) {});

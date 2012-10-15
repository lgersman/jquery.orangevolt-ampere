var express = require('express');

var app = express();

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

app.listen( 8090);
console.log('\n  listening on port 8090\n');

	// assume unix/linux
require('child_process').exec('xdg-open http://localhost:8090/', function( error, stdout, stderr) {});

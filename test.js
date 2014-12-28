/*
 * (C) 2014 Seth Lakowske
 */

var test = require('tape');
var http = require('http');
var Push = require('./');
var fs   = require('fs');

test('it sends a valid push event', function(t) {

    var port = 4444;
    var path = '/webhook';

    var server = http.createServer(function(req, res) {
        console.log(JSON.stringify(req.headers));
        console.log(req.url);
        console.log(req.method);

        res.writeHead(200, {'Content-Type':'text/plain'});
        res.end('got request');
    })

    server.listen(port);

    //read in event template
    var event = fs.readFileSync('event.txt').toString();

    //describe the webhook push event
    var push = new Push({
        url       : 'http://localhost:'+port+path,
        delivery  : 'b476ef00-8d9e-11e4-9962-1c7fc692548e',
        signature : 'sha1=171c2ede2a4ccc4f108bb19438fce8729031336c',
        string    : event,
        hostname  : 'localhost',
        port      : port,
        path      : path,
    })

    //send the push event
    push.push();
    

})
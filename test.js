/*
 * (C) 2014 Seth Lakowske
 */

var test       = require('tape');
var http       = require('http');
var Push       = require('./').Push;
var PushEvent  = require('./').PushEvent;
var fs         = require('fs');
var handlebars = require('handlebars');

test('it sends a valid push event', function(t) {

    var port = 4444;
    var path = '/webhook';

    var server = http.createServer(function(req, res) {
        console.log(JSON.stringify(req.headers));
        t.strictEquals(req.url, path, 'url should match ' + path);
        t.strictEquals(req.method, 'POST', 'should be a post request');
        var body = '';
        var event = null;
        req.on('data', function(chunk) {
            body += chunk.toString();
        });

        req.on('end', function() {
            console.log('got an event')
            event = JSON.parse(body);
            t.strictEquals(event.ref, 'refs/heads/master', 'should be a push event on master');
            console.log(event.ref);
        })

        res.writeHead(200, {'Content-Type':'text/plain'});
        res.end('got request');
    })

    server.listen(port);

    //read in event template
    var pushEvent = new PushEvent();
    var result = pushEvent.get({
        'ref'   :'refs/heads/master',
        'before':'171c2ede2a4ccc4f108bb19438fce8729031336d',
        'after' :'171c2ede2a4ccc4f108bb19438fce8729031336e',
        'commit':'171c2ede2a4ccc4f108bb19438fce8729031336e',
        'username'  :'someUser',
        'repository':'someRepo',
        'email'     :'some@email.com'
    });

    console.log(result);

    //describe the webhook push event
    var push = new Push({
        url       : 'http://localhost:'+port+path,
        delivery  : 'b476ef00-8d9e-11e4-9962-1c7fc692548e',
        signature : 'sha1=171c2ede2a4ccc4f108bb19438fce8729031336c',
        string    : result,
        hostname  : 'localhost',
        port      : port,
        path      : path,
    })

    //send the push event
    push.push(function(response) {
        console.log('responseString: ' + response);
        console.log('shutting down server');
        server.close();
        t.end();
    });

})

/*
 * (C) 2014 Seth Lakowske
 */

var http       = require('http');
var handlebars = require('handlebars');
/*
 * Returns a partialy constructed options object.
 */
function getOptions(url, delivery, signature, length) {

    var options = {
        url : url,
        headers : {
            'x-github-event' : 'push',
            'x-github-delivery' : delivery,
            'x-hub-signature' : signature,
            'user-agent' : 'GitHub-Hookshot/2f00e0f',
            'Content-Type' : 'application/json',
            'Content-Length' : length
        }
    }

    return options;

}

/*
 * An event factory
 */
function PushEvent() {
    this.event = fs.readFileSync(__dirname + '/pushEvent.txt').toString();
    this.template = handlebars.compile(this.event);
}

PushEvent.prototype.get = function(values) {
    return this.template(values);
}

/*
 * A Github Push event.
 */
function Push(options) {
    this.options = getOptions(options.url,
                              options.delivery,
                              options.signature,
                              options.string.length);
    this.options.hostname = options.hostname;
    this.options.port     = options.port;
    this.options.path     = options.path;
    this.options.method   = 'POST';
    this.options.string   = options.string;
}

Push.prototype.push = function(onEnd) {
    console.log('generating push request');

    var self = this;

    var req = http.request(self.options, function(res) {

        console.log('STATUS: '  + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));

        res.setEncoding('utf8');
        var responseString = '';

        res.on('data', function(chunk) {
            console.log('BODY: ' + chunk);
            responseString += chunk.toString();
        })

        res.on('end', function() {
            onEnd(responseString);
            //self.result = JSON.parse(responseString);
        })

    })

    req.write(self.options.string);
    req.end();
}

module.exports.Push      = Push;
module.exports.PushEvent = PushEvent;

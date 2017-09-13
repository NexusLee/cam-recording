var path = require('path');
var ejs = require('ejs');
var fs = require('fs');

var express = require('express');

var WebSocketServer = require('websocket').server;

var app = express();

var index = require('./routes/index');

app.engine('.html', ejs.__express);
app.set('view engine', 'html');

app.use('/', index);

app.use(express.static(path.join(__dirname, 'public')));

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});

var writeStream = fs.createWriteStream('file.flv');

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

wsServer.on('connection', function (ws) {
    console.log('client connected');
    wsServer.on('message', function (message) {
        console.log(message);
    });
});

wsServer.on('request', function(request) {
    //if (!originIsAllowed(request.origin)) {
    //    // Make sure we only accept requests from an allowed origin
    //    request.reject();
    //    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
    //    return;
    //}

    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            //connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            //connection.sendBytes(message.binaryData);
            writeStream.write(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        writeStream.end();
    });
});

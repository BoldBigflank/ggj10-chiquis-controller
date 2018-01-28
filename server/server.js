// DEPENDENCIES
// ============
var express = require("express"),
    http = require("http"),
    port = (process.env.PORT || 8001),
    server = express();

// SERVER CONFIGURATION
// ====================
server.configure(function() {

  server.use(express["static"](__dirname + "/../public"));

  server.use(express.errorHandler({

    dumpExceptions: true,

    showStack: true

  }));

  server.use(express.bodyParser())

  server.use(server.router);

});

// SERVER
// ======

// Start Node.js Server
var httpServer = http.createServer(server).listen(port);
var io = require('socket.io')(httpServer);

// SOCKET.IO
io.on('connection', function (socket) {
    console.log("socket connected", socket.id);
    socket.emit('test-event', { hello: 'world' });
    socket.on("join", function (data) {
        console.log(data);
        console.log("** joined", data.id);
        socket.join(data.room);
        if (data.id && data.room == "controller") socket.join('player-'+data.id);
        socket.to("screen").emit("join", data);
    });
    socket.on("player", function (data) {
        socket.to("player-" + data.id).emit("player", data);
    });
    socket.on('screen', function (data) {
        socket.to('screen').emit('action', data);
    });
    socket.on('action', function (data) {
        console.log("action", data);
        // Pass it to the screen
        socket.to('screen').emit('action', data);
    });
});

console.log('Welcome to Backbone-Require-Boilerplate!\n\nPlease go to http://localhost:' + port + ' to start using Require.js and Backbone.js');

module.exports = server;
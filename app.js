var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var redisUrl = process.env.REDIS_URL || "127.0.0.1";
var redis = require("redis"),
    redisClient = redis.createClient(6379, redisUrl);

var port = process.env.PORT || 5000,
    oneDay = 86400000;

app.use(express.static('public', { maxAge: oneDay }));

http.listen(port, function(){
  console.log('listening on *: ' + port);
});

// io.on('connection', function(socket){
//   console.log('a user connected');
//
//   socket.on('disconnect', function(){
//     console.log('user disconnected');
//   });
// });

redisClient.on("ready", function () {
  console.log("Connected to Redis!");
  redisClient.psubscribe("*");
});

redisClient.on("pmessage", function (pattern, channel, message) {
  var c = channel.split(":");
  var model = c[1];
  var action = c[0];
  io.emit("activity", {model: model, action: action});
});

redisClient.on("error", function (err) {
  console.log("Redis error: " + err);
});


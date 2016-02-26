var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var irobot = require('./index');
var robot = new irobot.Robot('/dev/ttyUSB0');

//pageName is the same as fileName but with .html instead of .js
pageName = process.argv[1];
var n = pageName.lastIndexOf('/');
var pageName = pageName.substring(n + 1);
pageName = pageName.replace(".js", ".html");

//if port not given use this as default
var port = (process.argv[4] ? Number(process.argv[4]) : 4004);
app.listen(port);
console.log("listening on port ", port);

function handler(req, res) {
    fs.readFile(__dirname + '/' + pageName, processFile);

    function processFile(err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading ' + pageName);
        }
        res.writeHead(200);
        res.end(data);
    }
}

robot.on('ready', function() {
    console.log("Robot ready!.");
});

io.on('connection', onConnect);

function onConnect(socket) {
    console.log('connected');
    robot.sensorCount = 0;
    socket.on('drive', function(data) {
        console.log(data);
        robot.drive(data);
    });
    socket.on('sing', function(data) {
        console.log(data);
        robot.sing(data);
    });

    socket.on('safeMode', function(data) {
        robot.safeMode();
    });

    socket.on('fullMode', function(data) {
        robot.fullMode();
    });
}

robot.on('sensordata', function(data) {
    //console.log('SENSOR DATA', data);
    if(!robot.sensorCount) robot.sensorCount = 0;
    robot.sensorCount ++;
    if (robot.sensorCount*1 % 10==0)
    {
    io.sockets.emit('sensordata', data);
}
});


ThunderConnector = require('./thunder-connector');

var keypress = require('keypress')
  , tty = require('tty');

// make `process.stdin` begin emitting "keypress" events

ThunderConnector.connect();

function up(degrees){
    stopTime = Math.floor(degrees * 22.3);
    setTimeout(function(){ThunderConnector.command('up');},0);
    setTimeout(function(){ThunderConnector.command('stop');},stopTime);
}

function down(degrees){
    stopTime = Math.floor(degrees * 22.3);
    setTimeout(function(){ThunderConnector.command('down');},0);
    setTimeout(function(){ThunderConnector.command('stop');},stopTime);
}

function turnRightDegrees(degrees){
    stopTime = Math.floor(degrees * 22.3)
    setTimeout(function(){ThunderConnector.command('right');},0);
    setTimeout(function(){ThunderConnector.command('stop');},stopTime);
}

function turnLeftDegrees(degrees){
    stopTime = Math.floor(degrees * 22.3)
    setTimeout(function(){ThunderConnector.command('left');},0);
    setTimeout(function(){ThunderConnector.command('stop');},stopTime);
}

function fire(){
    setTimeout(function(){ThunderConnector.command('fire');},0);
}

keypress(process.stdin);

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  console.log('got "keypress"', key);

  if (key.name == 'w'){
    console.log("moved up");
    up(10);
  } else if (key.name == 's'){
    console.log("moved down");
    down(10);
  } else if (key.name == 'd'){
    console.log("moved right");
    turnRightDegrees(10);
  } else if (key.name == 'a'){
    console.log("moved left");
    turnLeftDegrees(10);
  } else if (key.name == 'space'){
    console.log("fired");
    fire();
  }


  if (key && key.ctrl && key.name == 'c') {
    process.stdin.pause();
  }
});

if (typeof process.stdin.setRawMode == 'function') {
  process.stdin.setRawMode(true);
} else {
  tty.setRawMode(true);
}
process.stdin.resume();
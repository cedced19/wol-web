var express = require('express');
var app = express();
var exec = require('child_process').exec;
var path = require('path');
const port = 9080;
var ping = require('ping');

app.get('/', function(req, res) {
  res.send('Hello World WOL WEB');
});

app.get('/power', function(req, res) {
  res.sendFile(path.join(__dirname, './index.html'));
});

app.post('/power', function(req, res) {
    exec('wakeonlan -i 192.168.0.255 -p 7 40:61:86:c8:ca:b2', function(err, stdout, stderr) {
        if (err || stderr.includes('Error')) {
            res.send('Error');
            console.log(stderr);
        } else {
            res.send('Magic packet sent.');
        }
    });
});

app.get('/power/ping', function(req, res) {
  ping.sys.probe('192.168.0.62', function(isAlive){
    res.json({status: isAlive ? true : false });
  });
});

app.listen(port, () => {
  console.log(`WOL Web listening on port ${port}`)
})
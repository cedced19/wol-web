var express = require('express');
var app = express();
var exec = require('child_process').exec;
var path = require('path');
const port = 9080;
var ping = require('ping');
var config = require('./config.json');

// Add middleware to parse JSON bodies
app.use(express.json());

app.get('/', function(req, res) {
  res.send('Hello World WOL WEB');
});

app.get('/power', function(req, res) {
  res.sendFile(path.join(__dirname, './index.html'));
});

app.post('/power', function(req, res) {
    // Check if password is provided and correct
    if (!req.body.password || req.body.password !== config.password) {
        return res.status(401).json({error: true, message: 'Invalid password'});
    }
    
    exec(`wakeonlan -i ${config.broadcast_ip} -p 7 ${config.command_mac}`, function(err, stdout, stderr) {
        if (err || stderr.includes('Error')) {
            res.json({error: true});
            console.log(stderr);
        } else {
          res.json({error: false});
        }
    });
});

app.get('/power/ping', function(req, res) {
  ping.sys.probe(config.command_ip, function(isAlive){
    res.json({status: isAlive ? true : false });
  });
});

app.listen(port, () => {
  console.log(`WOL Web listening on port ${port}`)
})
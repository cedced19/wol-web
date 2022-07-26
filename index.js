var express = require('express');
var app = express();
var exec = require('child_process').exec;
const port = 9080

app.get('/', function(req, res) {
  res.send('Hello World WOL WEB');
});

app.get('/power', function(req, res, next) {
    exec('wakeonlan -i 192.168.0.255 -p 7 40:61:86:c8:ca:b2', function(err, stdout, stderr) {
        if (err || stderr.includes('Error')) {
            res.send('Error');
            console.log(stderr);
        } else {
            res.send('Magic packet sent');
        }
    });
    
});

app.listen(port, () => {
  console.log(`WOL Web listening on port ${port}`)
})
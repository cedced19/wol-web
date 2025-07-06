var express = require('express');
var app = express();
var exec = require('child_process').exec;
var path = require('path');
const port = 9080;
var ping = require('ping');
var config = require('./config.json');

// Add middleware to parse JSON bodies
app.use(express.json());

// IP blacklist tracking
const failedAttempts = new Map(); // IP -> { count: number, lastAttempt: Date }
const blacklistedIPs = new Set(); // Set of blacklisted IP addresses
const MAX_ATTEMPTS = 4;
const BLACKLIST_DURATION = 120 * 60 * 1000; // 120 minutes in milliseconds

// Middleware to check if IP is blacklisted
app.use('/power', function(req, res, next) {
    const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket?.remoteAddress;
    
    if (blacklistedIPs.has(clientIP)) {
        return res.status(403).json({error: true, message: 'IP address is blacklisted due to too many failed attempts'});
    }
    
    next();
});

// Function to get client IP
function getClientIP(req) {
    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket?.remoteAddress;
}

// Function to handle failed password attempt
function handleFailedAttempt(clientIP) {
    const now = new Date();
    
    if (!failedAttempts.has(clientIP)) {
        failedAttempts.set(clientIP, { count: 1, lastAttempt: now });
    } else {
        const attempts = failedAttempts.get(clientIP);
        attempts.count++;
        attempts.lastAttempt = now;
        
        if (attempts.count >= MAX_ATTEMPTS) {
            blacklistedIPs.add(clientIP);
            console.log(`IP ${clientIP} blacklisted after ${MAX_ATTEMPTS} failed attempts`);
            
            // Remove from failed attempts tracking
            failedAttempts.delete(clientIP);
            
            // Schedule removal from blacklist after duration
            setTimeout(() => {
                blacklistedIPs.delete(clientIP);
                console.log(`IP ${clientIP} removed from blacklist`);
            }, BLACKLIST_DURATION);
        }
    }
}

// Function to handle successful password attempt
function handleSuccessfulAttempt(clientIP) {
    failedAttempts.delete(clientIP);
}

app.get('/', function(req, res) {
  res.send('Hello World WOL WEB');
});

app.get('/power', function(req, res) {
  res.sendFile(path.join(__dirname, './index.html'));
});

app.post('/power', function(req, res) {
    const clientIP = getClientIP(req);
    
    // Check if password is provided and correct
    if (!req.body.password || req.body.password !== config.password) {
        handleFailedAttempt(clientIP);
        return res.status(401).json({error: true, message: 'Invalid password'});
    }
    
    // Password is correct, clear any failed attempts for this IP
    handleSuccessfulAttempt(clientIP);
    
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

app.get('/power/debug/blacklist', function(req, res) {
  res.json({status: 'ok', blacklist: Array.from(blacklistedIPs), failedAttempts: Array.from(failedAttempts.entries())});
});

app.listen(port, () => {
  console.log(`WOL Web listening on port ${port}`)
})
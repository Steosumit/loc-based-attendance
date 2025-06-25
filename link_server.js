//Loading Component modules
const exp = require('constants');
var express = require('express');
var session = require('express-session');
var path = require('path');

var app = express();

//Listening 
app.listen(7000, () => {
    console.log('Listening at PORT: 7000(as link_server.js)');
})

//Global variables
var ipQueue = []; //init

//Middlewares

app.use(express.json());
app.use(session({
    secret : 'some_secret_code',
    resave : true,
    saveUninitialized : true,
    cookie : { maxAge : 1 * 60 * 1000},
    submittedIPs : [] //this has to be created inside and outside the session object
}));

//Route definitions
app.get('/home', (req, res) => {

    console.log('GET method of link_server>>');
    res.status(200, 'Connection OK');
    ip = req.socket.remoteAddress; //Get IP
    console.log(`Got in link_server IP Address :${ip}`);
    //NOTE: submittedIPs property needs to be put manually which CANNOT be done in session({ - : -}) 
    //as its not a default property
    if (!req.session.submittedIPs) {
        req.session.submittedIPs = [];
        console.log('ipQueue --> submittedIPs obj not existing, so created');
    }
    ipQueue = req.session.submittedIPs;
    console.log(`Got in link_server ipQueue :`);
    console.log(req.session.submittedIPs);
    //req.session.submittedIPs; // Get IP Queue object
    
    //Check IP uniquity
    if (!checkIP(ip)) {
        htmlWritingFor403 = "<span style='color: red; font-weight: bold;'>Multiple attendance entry requests detected! 403 Unauthorized<br>CAUTION:<br>Further attempts might lead to your device being<br> blocked for 24 hrs</span>"
        res.status(403).send(htmlWritingFor403);
    } else {
        res.redirect('http://localhost:5000/');
        console.log('Redirecting to: http://localhost:5000/');
    }

    //Send HTML CSS JS to browser
    // NO NEED IN CASE OF MIDDLEWARE res.sendFile(path.join(__dirname, 'public', 'Index.html')); 
})

//All functions...................................................................................


function checkIP (req) {
    if (ipQueue.includes(ip)) {
        console.log(`IP: ${ip} already entered. Resubmission blocked`);
        return false;
    } else {
        ipQueue.push(ip);
        console.log(`New IP: ${ip} detected for this session. IP pushed to ipQueue`);
        console.log(ipQueue);
        return true;
    }
}
'use strict';

const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    path = require('path');

let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);

app.engine('ejs', require('ejs-locals'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: '434dbc979dde137b5a2a5a4916464fecc8f7997f0caebd19e6e5d48b622a896b', // is a cookie
    name: 'TG_USR_SESSION',
    secure: false
}));

require('./mongo')(mongoose, app);
require('./interact')(io);

app.get('/', (req, res) => {
    if(req.session.user) res.render(path.resolve(__dirname, '../', 'views', 'dashboard.ejs'), {
        user: req.session.user
    });
    else res.render(path.resolve(__dirname, '../', 'views', 'index.ejs'));
});
app.get('/logout', (req, res) => {
    req.session.user ? delete req.session.user : null;
    res.redirect('https://www.grove-mmo.com/');
});
app.get('/about', (req, res) => res.redirect('https://www.grove-mmo.com/about.html'));
app.get('/pwreset', (req, res) => res.render(path.resolve(__dirname, '../', 'views', 'pwreset.ejs')));
app.get('/settings', (req, res) => res.render(path.resolve(__dirname, '../', 'views', 'settings.ejs')));
app.get('/play', (req, res) => {
    res.render(path.resolve(__dirname, '../', 'views', req.session.user ? 'play.ejs' : 'login.ejs'), {
        user: req.session.user
    });
});
app.get('/login', (req, res) => res.redirect('https://www.grove-mmo.com/login.html'));
app.get('/register', (req, res) => res.redirect('https://www.grove-mmo.com/register.html'));

http.listen(process.env.PORT || 8080, (listening) => {
    if (!process.env.NODE_ENV)
        console.log('Listening For conections on port 8080');
});
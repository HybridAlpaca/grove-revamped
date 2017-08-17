'use strict';

const express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    path = require('path');

let app = express();

app.engine('ejs', require('ejs-locals'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'ndeivbfrhwbyrwhfyewhrfewihrbverwbvjhebbj'
}));

require('./mongo')(mongoose, app);

/* Conflicts with Heroku servers 


   function ensureSecure(req, res, next) {
    if (req.secure) return next();
    if (req.headers["x-forwarded-proto"] === "https") return next();
    res.redirect('https://' + req.hostname + req.url); // express 4.x
}

app.all('*', ensureSecure); // at top of routing calls
*/

app.get('/', (req, res) => res.render(path.resolve(__dirname, '../', 'views', req.session.user ? 'dashboard.ejs' : 'index.ejs')));
app.get('/logout', (req, res) => {
    req.session.user ? delete req.session.user : null;
    res.redirect('/');
});
app.get('/about', (req, res) => res.render(path.resolve(__dirname, '../', 'views', 'about.ejs')));
app.get('/pwreset', (req, res) => res.render(path.resolve(__dirname, '../', 'views', 'pwreset.ejs')));
app.get('/settings', (req, res) => res.render(path.resolve(__dirname, '../', 'views', 'settings.ejs')));
app.get('/play', (req, res) => res.render(path.resolve(__dirname, '../', 'views', req.session.user ? 'play.ejs' : 'login.ejs')));
app.get('/login', (req, res) => res.render(path.resolve(__dirname, '../', 'views', 'login.ejs')));
app.get('/register', (req, res) => res.render(path.resolve(__dirname, '../', 'views', 'register.ejs')));

app.listen(process.env.PORT || 8080, (listening) => {
    if (!process.env.NODE_ENV)
        console.log('Listening For conections on 0.0.0.0');
});

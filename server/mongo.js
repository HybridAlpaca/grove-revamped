'use strict';

module.exports = (mongoose, app) => {

    let db = mongoose.connection;
    let User = mongoose.model('User', {
        username: String,
        password: String
    });

    db.on('error', console.error);
    db.once('open', () => {
        console.log('Successfully connected to MongoDB');
    });
    mongoose.connect('mongodb://admin:p455w0rd@ds133221.mlab.com:33221/grove-v2');

    // request handling

    app.post('/login', (req, res) => {
        User.findOne({
            username: req.body.username,
            password: require('md5')(req.body.password)
        }, (err, obj) => {
            if (err) console.error(err);
            else if (obj) {
                console.log(`${obj.username} has logged in.`);
                req.session.user = obj;
                res.redirect('/');
            }
            else {
                res.redirect('/login?err=user_not_found');
            }
        });
    });

    app.post('/register', (req, res) => {
        if (req.body.password !== req.body.confPassword) return res.redirect('/register?err=passwords_no_match');
        User.findOne({
            username: req.body.username
        }, (err, obj) => {
            if (err) console.error(err);
            else if (obj) {
                res.redirect('/register?err=user_exists');
            }
            else {
                let u = new User({
                    username: req.body.username,
                    password: require('md5')(req.body.password),
                });
                u.save((err, obj) => {
                    if (err) console.error(err);
                    else if (obj) {
                        console.log(`${obj.username} has created an account.`);
                        req.session.user = obj;
                        res.redirect('/');
                    }
                    else throw new Error('Something (bad) happened!');
                });
            }
        });
    });

};

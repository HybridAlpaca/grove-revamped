'use strict';

module.exports = (mongoose, app) => {

    let db = mongoose.connection;
    let User = mongoose.model('User', {
        username: String,
        password: String,
        map: String,
        email: String,
        character: {
            race: String,
            'class': String,
            lvl: Number,
            xp: Number,
            inv: Array
        }
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
                res.redirect('https://grove-mmo.com/login');
            }
        });
    });

    app.post('/register', (req, res) => {
        if (req.body.password !== req.body.confPassword) return res.redirect('https://grove-mmo.com/register');
        User.findOne({
            username: req.body.username
        }, (err, obj) => {
            if (err) console.error(err);
            else if (obj) {
                res.redirect('https://grove-mmo.com/register');
            }
            else {
                let u = new User({
                    username: req.body.username,
                    password: require('md5')(req.body.password),
                    email: req.body.email,
                    map: 'skjar-isles',
                    character: {
                        race: 'human',
                        'class': 'noob',
                        lvl: 1,
                        xp: 0,
                        inv: []
                    }
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

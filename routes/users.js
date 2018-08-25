const router = require('express').Router()
    , passport = require('passport')
    , jwt = require('jsonwebtoken')
    , config = require('../config/config')
    , User = require('../models/users');
    
// Register
router.post('/register', (req, res, next) => {
    // res.send('Register');
    let newUser = new User({
        username: req.body.username,
        password: req.body.password
    });

    User.addUser(newUser, (err, user) => {
        if(err){
            let error = err;
            var pathError = error.errmsg;
            var message = pathError.substring(pathError.lastIndexOf("index:")+7,pathError.lastIndexOf("_1"));
            var errorMsg;
            if(message === "username") {
                errorMsg = "Username already exist!";
            } else {
                errorMsg = "Something went wrong!"
            }
            res.json({success: false, msg: errorMsg});
        } else {
            res.json({success: true, msg: "User registered", user: user});
        }
    });
});

// Authenticate
router.post('/authenticate', function(req, res, next) {
    // res.send('Authenticate')
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if(err) throw err;
        if(!user) {
            return res.json({success: false, msg: 'User not found'}); 
        }
        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err;
            if(isMatch){
                const token = jwt.sign({data: user}, config.dev.secret, {
                    expiresIn: 604800 // a week
                })

                res.json({
                    success: true,
                    msg: 'You are now logged in',
                    token: 'Bearer ' + token,
                    user: {
                        id: user._id,
                        username: user.username
                    }
                })
            } else {
                return res.json({success: false, msg: 'Wrong password'})
            }
        })
    })
});

// Profile
router.get('/profile', passport.authenticate('jwt', {session: false}), function(req, res, next) {
    // res.send('Profile')
    res.json({user: req.user});
});

// Logout
router.post('/logout', passport.authenticate('jwt', {session: false}), function(req, res, next) {
    const username = req.body.username;

    User.setInactive(username, (err, user) => {
        if(err) throw err;
        if(!user) {
            return res.json({success: false, msg: 'User not found'});
        }
        res.json({success: true, msg: "Logout success"});
    })
});
module.exports = router;
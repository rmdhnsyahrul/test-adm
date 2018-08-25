"use strict";

const JwtStrategy   = require('passport-jwt').Strategy
    , ExtractJwt    = require('passport-jwt').ExtractJwt
    , config        = require('../config/config')
    , User          = require('../models/users');

module.exports = function(passport){
    let opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = config.dev.secret;
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        User.getUserById(jwt_payload.data._id, (err, user) => {
            if (err){
                return done(err, false);
            }

            if(user){
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
    }));
}
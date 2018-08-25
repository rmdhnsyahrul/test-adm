const express = require('express')
    , path = require('path')
    , bodyParser = require('body-parser')
    , cors = require('cors')
    , passport = require('passport')
    , fileUpload = require('express-fileupload')
    // , mongoose = require('mongoose')
    , app = express();

// Define Routes
const user = require('./routes/users');
const channel = require('./routes/channels');
const category = require('./routes/categories');
const content = require('./routes/contents');
const playlist = require('./routes/playlist');

// CORS Middleware
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());

// Express Fileupload
app.use(fileUpload());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.use('/user', user);
app.use('/channel', channel);
app.use('/category', category);
app.use('/content', content);
app.use('/playlist', playlist);

// Index route
app.get('/', (req, res) => {
    res.send('Invalid endpoint');
});

module.exports = app;
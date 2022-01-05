const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const cookieParser = require('cookie-parser');
const path = require('path');
const app = express();

require('dotenv').config({ path: 'variables.env' })

const PORT = process.env.PORT || 5000;

// Initialize DB connection
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true
}).then((result) => {
    console.log('Database is connected')
}).catch(err => console.log(err));

// Init Middleware
app.set('view engine', 'pug')
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static( path.join(__dirname, '/bower_components')));

// Initialize Cookies
app.use(cookieParser());

// Initialize session for storing DATA
app.use(session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    cookie: {maxAge: 360000},
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongoUrl: process.env.DB_URL })
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.flashes = req.flash();
    res.locals.authenticated = req.session.authenticated
    next();
});

// Define routes
app.use('/', require('./router/router'));
app.use('/api/auth', require('./router/auth'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
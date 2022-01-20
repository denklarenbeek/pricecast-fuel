const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const cookieParser = require('cookie-parser');
const path = require('path');
const helpers = require('./utility/helper');
const ip = require('ip');
const app = express();

const redis = require("redis");
const client = redis.createClient({url: process.env.REDIS_URL});

require('dotenv').config({ path: 'variables.env' })

const PORT = process.env.PORT || 5000;

// Initialize DB connection
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true
}).then((result) => {
    console.log('Database is connected')
}).catch(err => console.log(err));


//Initialize workers
client.on('error', (err) => console.log('Redis Client Error', err));
client.connect().then(() => {
    console.log('redis connected');
}).catch(err => console.log(err));
require('./backgroundWorker');


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
    cookie: {maxAge: 36000000},
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongoUrl: process.env.DB_URL })
}));

app.use(flash());

app.use((req, res, next) => {
    res.locals.h = helpers;
    res.locals.flashes = req.flash();
    res.locals.authenticated = req.session.authenticated
    res.locals.user = req.session.user
    res.locals.currentPath = req.path;
    next();
});

// Define routes
app.use('/', require('./router/router'));
app.use('/api/auth', require('./router/auth'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} with IP address of ${ip.address()}`);
});
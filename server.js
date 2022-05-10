const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const cookieParser = require('cookie-parser');
const path = require('path');
const helpers = require('./utility/helper');
const ip = require('ip');
const http = require('http');
const app = express();

const server = http.createServer(app);

// Initializing Socket.io
const socketApi = require('./utility/socket-io');
const io = socketApi.io;
io.attach(server);

// const redis = require("redis");
// const client = redis.createClient(process.env.REDIS_URL);

require('dotenv').config({ path: 'variables.env' })

const PORT = process.env.PORT || 3000;

// Initialize DB connection
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true
}).then((result) => {
    console.log('Database is connected')
}).catch(err => console.log(err));

//Initialize workers
// client.on('error', (err) => console.log('Redis Client Error', err));
// client.on('connect', () => {
//     console.log('REDIS is connected.....')
// });
// client.connect().then(() => {
//     console.log('redis connected');
// }).catch(err => console.log('error', err));

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
exports.sessionMiddleWare = session({
    secret: process.env.SECRET,
    key: process.env.KEY,
    cookie: {maxAge: 36000000},
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongoUrl: process.env.DB_URL })
});

app.use(this.sessionMiddleWare);

app.use(flash());

app.use((req, res, next) => {
    res.locals.h = helpers;
    res.locals.flashes = req.flash('notification')
    res.locals.authenticated = req.session.authenticated
    res.locals.user = req.session.user
    res.locals.currentPath = req.path;
    res.locals.documents = req.flash('documents')
    next();
});

// Define routes
app.use('/', require('./router/router'));
app.use('/api/auth', require('./router/auth'));
app.use('/uniti-crm', require('./router/crm'));

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} with IP address of ${ip.address()}`);
});
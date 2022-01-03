const express = require('express');
const path = require('path');
const app = express();

require('dotenv').config({ path: 'variables.env' })

const PORT = process.env.PORT || 5000;

// Init Middleware
app.set('view engine', 'pug')
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static( path.join(__dirname, '/bower_components')));

// Define routes
app.use('/', require('./router/router'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
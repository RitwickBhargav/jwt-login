const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const path = require('path');

//Bring in the database object
const config = require('./config/database');

//Mongodb Config
mongoose.set('useCreateIndex', true);

//Connect with the database
mongoose.connect(config.database, { useNewUrlParser: true })
    .then(() => {
        console.log('Database Connected');
    }).catch(err => {
        console.log(err);
    });

//initialize the app
const app = express();

//Defining the PORT
const PORT = process.env.PORT || 5000;

//Defining the Middlewares
app.use(cors());

//Set the static folder
app.use(express.static(path.join(__dirname, 'public')));

//Body Parser Middleware
app.use(bodyParser.json());

//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    return res.json({
        message: "This is node.js role-based authentication system"
    });
});

//Bringing in the user routes
const users = require('./routes/users');
app.use('/api/users', users);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})
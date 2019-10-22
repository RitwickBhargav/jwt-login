const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const path = require('path');

const config = require('./config/database');

//Mongodb Config
mongoose.set('useCreateIndex', true);


mongoose.connect(config.database, { useNewUrlParser: true })
    .then(() => {
        console.log('Database Connected');
    }).catch(err => {
        console.log(err);
    });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
    return res.json({
        message: "role-based authentication system test"
    });
});

const checkUserType = (req, res, next) => {
    const userType = req.originalUrl.split('/')[2];
    require('./config/passport')(userType, passport);
    next();
}

app.use(checkUserType);

const users = require('./routes/users');
app.use('/api/users', users);

const admin = require('./routes/admin');
app.use('/api/admin', admin);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})
//this could be implemented in any project which requires authentication.
//use the code and modify it accordingly

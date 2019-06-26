const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/database');

router.post('/register', (req, res) => {
    let newUser = new User({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        contact: req.body.contact,
        password: req.body.password
    });
    User.addUser(newUser, (err, user) => {
        if (err) {
            console.log(err)
            let message = "";
            if (err.errors.username) message = "Username is already taken. ";
            if (err.errors.email) message += "Email already exists. ";
            return res.json(err);
        }
        return res.json({
            success: true,
            message: "User registration is Successful."
        });

    });
});

router.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }
        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                debugger
                const token = jwt.sign({
                    type: "user",
                    data: {
                        _id: user._id,
                        username: user.username,
                        name: user.name,
                        email: user.email,
                        contact: user.contact
                    }
                }, config.secret, {
                        expiresIn: 604880 //for 1 week time in ms
                    },
                    { algorithm: 'RS256'}
                );
                return res.json({
                    success: true,
                    token: "JWT " + token
                });
            } else {
                return res.json({
                    success: false,
                    message: "Wrong Password"
                });
            }
        });
    });
});
module.exports = router;
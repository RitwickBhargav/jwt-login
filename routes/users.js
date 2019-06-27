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
            //debugger
            //console.log(err)
            let message = "";
            let message1 = "";
            let message2 = "";
            if(err.errors.name != undefined)
                if(err.errors.name.kind == "required" || err.errors.username.kind == "required"||err.errors.email.kind == "required" ||err.errors.password.kind == "required" ||err.errors.contact.kind == "required") message = "All entries are Mandatory. ";
            if(err.errors.username != undefined)
                if (err.errors.username.kind == "unique") message1 = "Username is already taken. ";
            if(err.errors.email != undefined)
                if (err.errors.email.kind == "unique") message2 = "Email already exists. ";
            if(err.errors.email != undefined)
                if (err.errors.email.kind == "unique") message2 = "Email already exists. ";
            //return res.json(err);
            return res.json({
                success: false,
                error: "User validation failed!",
                entrynull : message,
                uname : message1,
                email : message2
            });
        }
        if(newUser.contact.length != 10 )
            return res.json({
                success: false,
                message: "Phone No. is wrong"
            });
            debugger
        if(req.body.password.length < 8 )
        return res.json({
            success: false,
            message: "Password should be of at least 8 characters"
        });
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
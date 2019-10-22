const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config/database');

router.post('/register', (req, res) => {
    let newAdmin = new Admin({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        contact: req.body.contact,
        password: req.body.password,
        job_profile: req.body.job_profile
    });
    //here is how to add admins
    Admin.addAdmin(newAdmin, (err, admin) => {
        if (err) {
            let message = "";
            let message1 = "";
            let message2 = "";
            if (err.errors.name != undefined)
                if (err.errors.name.kind == "required" || err.errors.username.kind == "required" || err.errors.email.kind == "required" || err.errors.password.kind == "required" || err.errors.contact.kind == "required") message = "All entries are Mandatory. ";
            if (err.errors.username != undefined)
                if (err.errors.username.kind == "unique") message1 = "Username is already taken. ";
            if (err.errors.email != undefined)
                if (err.errors.email.kind == "unique") message2 = "Email already exists. ";
            //return res.json(err);
            return res.json({
                success: false,
                error: "Admin validation failed!",
                entrynull: message,
                uname: message1,
                email: message2
            });
        }
        //contact number is not correct
        if (newAdmin.contact.length != 10)
            return res.json({
                success: false,
                message: "Phone No. is Wrong"
            });
        //password is not strong enough
        if (req.body.password.length < 8)
            return res.json({
                success: false,
                message: "Password should be of at least 8 characters"
            });
        return res.json({
            success: true,
            message: "Successful."
        });

    });
});

router.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    Admin.getAdminByUsername(username, (err, admin) => {
        if (err) throw err;
        //if admin is not found

        if (!admin) {
            return res.json({
                success: false,
                message: "Admin not found"
            });
        }
        Admin.comparePassword(password, admin.password, (err, isMatch) => {
            if (err) throw err;
            //if the password matches the original paasword
            if (isMatch) {
                const token = jwt.sign({
                    type: "admin",
                    data: {
                        _id: admin._id,
                        username: admin.username,
                        name: admin.name,
                        email: admin.email,
                        contact: admin.contact,
                        job_profile: admin.job_profile
                    }
                }, config.secret, {
                        expiresIn: 604880 //for 1 week time in ms
                    },
                    { algorithm: 'RS256' }
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

//Get Authenticated User Profile
router.get('/profile', passport.authenticate('jwt', {
    session: false
}), (req, res) => {
    return res.json(req.user);
});

module.exports = router;

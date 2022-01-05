const express = require('express');
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require('./middleware');
const logger = require('../logger');
const router = express.Router();

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local',(authError, user, info) => {
        
        if (authError) {
            logger.error(authError);
            return next(authError);
        }

        if (!user) {
            req.flash('loginError', info.message);
            return res.redirect('/');
        }

        return req.login(user, (loginError) => {
            if (loginError) {
                logger.error(loginError);
                return next(loginError);
            }
            return res.redirect('/scan');
        });

    })(req, res, next);
});

router.get('/logout', isLoggedIn, (req, res) => {
    logger.info(`LOGOUT : ${req.user.branchCode}${req.user.id} ${req.user.name}`);
    req.logout();
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const helmet = require('helmet');
const hpp = require('hpp');
require('dotenv').config();

const indexRouter = require('./routes');
const authRouter = require('./routes/auth');
const passportConfig = require('./passport');
const logger = require('./logger');

const app = express();
passportConfig(passport);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 8080);

if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
    app.use(helmet());
    app.use(hpp());
} else {
    app.use(morgan('dev'));
}

app.use('/static', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
const sessionOption = {
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    }
};
if (process.env.NODE_ENV === 'production') {
    //sessionOption.proxy = true;
    //sessionOption.cookie.secure = true;
}
app.use(session(sessionOption));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use('/', indexRouter);
app.use('/auth', authRouter);

app.use((req,res,next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err,req,res,next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

app.listen(app.get('port'), () => {
    logger.info(`Listening on ${app.get('port')}`);
});
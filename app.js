require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
const session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const DefaultAzureCredential =
  require('@azure/identity').DefaultAzureCredential;
const { createProxyMiddleware } = require('http-proxy-middleware');
const indexRouter = require('./routes');

const API_SERVICE_URL = 'https://staticresoucev2.z13.web.core.windows.net/';
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // set this to true on production
    },
  })
);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
app.use(async (req, res, next) => {
  const tokenCredential = new DefaultAzureCredential();
  const token = await tokenCredential.getToken(
    'https://storage.azure.com/.default'
  );

  req.headers.authorization = `Bearer ${token.token}`;
  next();
});

app.use(ignoreFavicon);
app.use('/blobs', indexRouter);
// app.use(
//   '/',
//   createProxyMiddleware({
//     target: API_SERVICE_URL,
//     changeOrigin: true,
//   })
// );
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function ignoreFavicon(req, res, next) {
  if (req.originalUrl.includes('favicon.ico')) {
    res.status(204).end();
  }
  next();
}

module.exports = app;

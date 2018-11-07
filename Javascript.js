import express from 'express';
import session from 'session';
import cors from 'cors';
import errorhandler from 'errorhandler';
import mongoose from 'mongoose';
import path from 'path';
import morgan from 'morgan';
import methodOverride from 'method-override';


const isProduction = process.env.NODE_ENV === 'production';

// Create global app object
const app = express();

app.use(cors());

//Take the morgan and methodOverride to the top of the file for readability
app.use(morgan('dev'));

app.use(methodOverride());

// using path join to combine the path segments into one, replacing '+'
const directory = path.join(__dirname, '/public');

app.use(express.static(directory))

/* reformat this line by splitting into two three lines using the braces as break points.
 This is for more readability
 */
app.use(session({
  secret: 'conduit',
  cookie: { maxAge: 60000 },
  resave: false, saveUninitialized: false
}));

if (!isProduction) {
  app.use(errorhandler());
}

if (isProduction) {
  mongoose.connect(process.env.MONGODB_URI);
} else {
  mongoose.connect('mongodb://localhost/conduit');
  mongoose.set('debug', true);
}


/**
 * Catch 404 and forward to error handler
 *
 * @param {object} request HTTP Request
 * @param {object} response  HTTP response
 * @param {function} next Callback function for middleware
 *
 * @return {void}
 */
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (!isProduction) {
  app.use((err, req, res, next) => {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({
      'errors': {
      message: err.message,
      error: err
    }});
  });
}

/**
 * Handles error for production
 *
 * @param {object} error Error
 * @param {object} request Express request object
 * @param {object} response Express response object
 *
 * @return {void}
 */
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    'errors': {
    message: err.message,
    error: {}
  }});
});

// finally, let's start our server...
const server = app.listen( process.env.PORT || 3000, () => {
  console.log(`Listening on port ' + ${server.address().port}`);
});

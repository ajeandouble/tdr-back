
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
require('dotenv').config()

require('./config/passport')(passport);

// DB Config
const db = require('./config/keys').MongoURI;
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log(`MongoDB connected...`))
    .catch(err => console.log(err))

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies

app.enable('trust proxy');

// Set session cookie
app.use(session({ store: new MongoStore({ url: require('./config/keys').MongoURI }), proxy: true, secret: 'anything', resave: true, saveUninitialized: true }));

// CORS
app.use(cors({
    origin: require('./config/keys.js').client_homepage_url,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', require('./routes/auth'));

// Check auth
app.use('/', (req, res, next) => {
    if (!req.user)
        res.status(401).json({ message: 'user has not been authenticated'});
    else
        next();
});


app.use('/api', require('./routes/api'));


// To del
app.get('/', (req, res) => { res.send('/') });

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on ${PORT}`));

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
require('dotenv').config()
const keys = require('./config/keys');
require('./config/passport')(passport);
const { session, sessionStore } = require('./config/session');

// Websockets
require('./chat');



// DB Config
const db = require('./config/keys').MongoURI;
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log(`MongoDB connected...`))
    .catch(err => console.log(err))

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies

app.set('trust proxy', 1); // For Heroku?

// Session
app.use(session({
    store: sessionStore,
    secret: keys.session_secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        path: "/",
        secure: true,
        domain: "tdr-front.herokuapp.com",
        httpOnly: true
    }
}));

// CORS
app.use(cors({
    origin: require('./config/keys.js').client_homepage_url,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));

app.use((req, rex, next) => { 
    next();
})

// Passport
const passportInit = passport.initialize();
app.use(passportInit);
const passportSession = passport.session();
app.use(passportSession);


// Routes
app.use('/auth', require('./routes/auth'));

// Check auth
app.use('/', (req, res, next) => {
    if (!req.user)
        res.status(401).json({ message: 'user has not been authenticated'});
    else {
		console.log(req._passport.session)
		next();
	}
});


app.use('/api', require('./routes/api'));


// To del
app.get('/', (req, res) => { res.send('/') });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server listenning on port ${PORT}`));

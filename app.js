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

// DB Config
const db = require('./config/keys').MongoURI;
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log(`MongoDB connected...`))
    .catch(err => console.log(err))

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies

if (process.env.NODE_ENV === 'development') {

}

else {
    app.set('trust proxy', 1); // For Heroku?

    console.log('NODE_ENV=', process.env.NODE_ENV);
    app.use(session({
        store: sessionStore,
        secret: keys.session_secret,
        resave: false,
        saveUninitialized: true,
        cookie: {
            path: "/",
            secure: true,
            sameSite: "none",
        }
    }));
}

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

const server = app.listen(PORT, () => console.log(`Server listenning on port ${PORT}`));

// Websockets
const socketIO = require('ws');

const log = (...args) => {
    console.log( ...args, );
}

const wss = new socketIO.Server({ server });
const wsUser_id = new Map();
const User_idWs = new Map();

let counter = 0;
wss.on('connection', function connection(wsConnection, socket) {
    counter = counter + 1;
    console.log('connection', counter)
    const cookie = socket.headers.cookie;
    const cookieParse = require('cookie').parse;
    const parsedCookie = cookieParse(cookie);
    if (parsedCookie) {
        const sid = parsedCookie['connect.sid'];
        const uncrypted_sid = require('cookie-parser').signedCookie(sid, keys.session_secret);
        if (uncrypted_sid) {
            sessionStore.get(uncrypted_sid, (err, session) => {
                if (err) throw err
                else if (session) {
                    wsUser_id.set (wsConnection, session['passport']['user']);
                    User_idWs.set(session['passport']['user'], wsConnection)
                    // console.log(wsConnection)
                    console.log(`Session for ${wsUser_id.get(wsConnection)}`)
                }
            });
        }
    }
    wsConnection.on('close', function close() {
        console.log(`Closing connection on ${wsUser_id.get(wsConnection)}`)
        const user_id = wsUser_id.get(wsConnection);
        wsUser_id.delete(wsConnection);
        User_idWs.delete(user_id);
        console.log(`wsUser_id.side=${wsUser_id.size}, ${User_idWs}`);
    });

    wsConnection.on('message', function incoming(message) {
        const incoming =  async () => {
            try {
                const data =  JSON.parse(message);

                console.log(`incoming message:${data} from ${wsUser_id.get(wsConnection)}`);
                // dispatch message:
                console.log(data, data.destination, data['destination'], typeof data, typeof message)
                if (data.destination) {
                    console.log(`Attempting to send a msg to ${data.destination}...`)
                    const dest = User_idWs.get(data.destination);
                    console.log(dest ? 'dest' : 'nondest')
                    if (dest) {
                        console.log('sending', JSON.stringify({ message: data.message, from: data.destination }))
                        dest.send(JSON.stringify({ message: data.message, from: wsUser_id.get(wsConnection)}));
                    }
                }
            }
            catch(err) {
                console.log('Error processing incoming message:', err);
            }
        }
        if (!wsUser_id.get(wsConnection)) {
            setTimeout(() => incoming(), 500);
        }
        else {
            incoming();
        }
    });

});

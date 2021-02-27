const session = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo(session);

const sessionStore = new MongoStore({ url: require('./keys').MongoURI });

module.exports = {
    session: session,
    sessionStore: sessionStore,
}


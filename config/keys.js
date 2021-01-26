const cluster = process.env.CLUSTER;
const db_pass = process.env.DB_PASS;
const db_name = process.env.DB_NAME;

// Use dotenv to retrieve some sensible data

module.exports = {
    MongoURI: `mongodb+srv://RMZHhwhRY3ubSAJI:${db_pass}@${cluster}${db_name}?retryWrites=true&w=majority`,
    facebook: {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    },
    client_homepage_url: process.env.CLIENT_HOMEPAGE_URL,
    cookie_key: 'yes',
}

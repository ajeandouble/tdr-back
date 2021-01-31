const WebSocket = require('ws');
const { UserModel } = require('./models/schemas');
const keys = require('./config/keys');
const { sessionStore } = require('./config/session');

const log = (...args) => {
    console.log( ...args, );
}
const wss = new WebSocket.Server({  port: 8080 });
const wsUser_id = new Map();
const User_idWs = new Map();

var z = null;
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
                    console.log('session retrieved')
                }
            });
        }
    }
    wsConnection.on('message', function incoming(message) {
        console.log('message sent');
        // Parse dest ... 
        // Verify user is connected
        // log msg in database
        if (!wsUser_id.get(wsConnection)) {
            setTimeout(() => {
                console.log('fuckTest:', `z=${z}`,wsConnection === z);
                console.log(`incoming message:${message} from ${wsUser_id.get(wsConnection)}`)
            }, 500);
        }
        else {
            console.log('message incoming:', message);
        }
    });

});

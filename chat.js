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

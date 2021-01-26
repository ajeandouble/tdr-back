const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const { UserModel } = require('../models/schemas');
const { facebook } = require('./keys');

module.exports = function(passport) {
    passport.use(
        new FacebookStrategy(
            {
                clientID: facebook.clientID,
                clientSecret: facebook.clientSecret,
                callbackURL: facebook.callbackURL,
                profileFields: ["email", "name"]
            },
            async function(accessToken, refreshToken, profile, done) {
                const { id, email, first_name, last_name } = profile._json;
                console.log(profile._json);
                const userData = {
                    user_id: id,
                    email: email,
                    firstName: first_name,
                    lastName: last_name
                };
                UserModel.updateOne({user_id: id}, userData, {upsert: true}, (err, obj) => {
                    console.log(err, obj)
                    done(null, userData);
                });
            }   
        )
    );

    passport.use(new LocalStrategy(
        function(username, password, done) {
            UserModel.findOne({ username: username }, function(err, user) {
                if (err) return done(err);
                if (!user) {
                    console.log(`User doesn't exist`);
                    return done(null, false);
                }
                user = user.toObject();
                if (user.password !== password) {
                    console.log( user, user['password'],   password, user.password, username, user.username);
                    console.dir(user)
                    console.log(`Incorrect password`);
                    return done(null, false);
                }
                    console.log(`Login successfull`);
                    return done(null, user);
          });
        }
      ));

    passport.serializeUser((user, done) => {
        console.log('serialize', user.user_id)
        done(null, user.user_id);
    });

    passport.deserializeUser((obj, done) => {
        console.log('deserialize', obj);
        done(null, obj);
    });
}

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { UserProfileModel } = require('../models/schemas');

router.post('/setActiveUserProfile', (req, res) => {
    console.log(`Setting ${req.user} (active user) profile with: ${req.body}`);
    console.log(req.body)
    const activeUserProfile = new UserProfileModel({user_id: req.user, ...req.body});
    UserProfileModel.updateOne({user_id: req.user}, {user_id: req.user, ...req.body, pics: [], likes: []}, {upsert: true}, (err, obj) => {
        console.log(err, obj);
        if (!err) res.status(201).json({success: true, message: 'Active user profile saved', data: null});
        else res.status(403).json({success: false, message: 'Impossible to save active user profile', data: null});
    });
});

router.get('/userInfo', (req, res) => {
    console.log(req.user)
    UserProfileModel.findOne({ user_id: req.user}, (err, obj) => {
        if (!err && obj) {
            obj = obj.toObject();
            console.log(obj.age)
            const data = {};
            // data.age = obj.age;
            // data.displayName = obj.displayName;
            // data.gender = obj.gender;
            // data.interrests = obj.interrests;
            // data.bio = obj.bio;
            ['age', 'displayName', 'gender', 'interrests', 'bio'].forEach(prop => data[prop] = obj[prop]);
            console.log(`data=${data}`);
            res.json({success: true, message: '', data: data});
        }
        else {
            res.status(404).send({success: false, message: 'profile has to be created', data: null});
        }
    });
});

router.get('/getDeck', (req, res) => {
    // RN returns every other users
    console.log(req.user)
     UserProfileModel.findOne({user_id: req.user}, (err, obj) => {    
        if (err) {
            res.status(401).json({sucess: false, messages: 'no users profiles left to like', data: null});
        }
        const likes = obj.likes;
        
        UserProfileModel.find({user_id: { $ne: req.user, $nin: likes }}, (err, obj) => {
            console.log(err, obj);
            if (err) {
                res.status(401).json({sucess: false, messages: 'user profiles not found', data: null});
            } else {
                res.status(201).json({success: true, message: 'found user profiles', data: obj})
            }
        });
    });
});

router.get('/getMatches', async (req, res) => {
    console.log('/getMatches');
    try {
        const profile = await UserProfileModel.findOne({ user_id: req.user });
        if (!profile) {
            throw new Error('Can\'t find active user profile');
        }
        const matches = await UserProfileModel.find({user_id: { '$in': profile.matches }});

        res.status(201).json({success: true, message: 'Matches successfully retrieved', data: matches})
    }
    catch (err) {
        const message = err.toString();
        const response = {success: false, message: message, data: null}
       res.status(401).json(response);
    }
});

router.post('/sendLike', async (req, res) => {
    console.log('send like')
    try {
        const profile = await UserProfileModel.findOne({ user_id: req.user });
        if (!profile) {
            throw new Error('Can\'t find active user profile');
        }
        const likes = new Set(profile['likes']);
        likes.add(req.body.user_id);
        console.log(likes)
        profile['likes'] = Array.from(likes);
        const user_doc = await UserProfileModel.findOne({ user_id: req.body.user_id }, (err) => {
            if (err) throw new Error('Like user_id doesn\'t exist');
        });
        if (!user_doc) {
            console.log('user_doc doesnt exist')
            throw new Error('Liked profile doesn`t exist');
        }
        if (user_doc.likes.indexOf(req.user) > -1) {
            console.log(`It's a match between ${user_doc.user_id} and ${req.user}`);
            console.log(user_doc.matches, profile.matches   )
            const user_doc_matches = new Set(user_doc.matches);
            const profile_matches = new Set(profile.matches);
            user_doc_matches.add(profile.user_id);
            profile_matches.add(user_doc.user_id);
            console.log(user_doc_matches, profile_matches)
            user_doc.matches = Array.from(user_doc_matches);
            profile.matches = Array.from(profile_matches);

            user_doc.save(err => {
                if (err) throw new Error('Can\'t update liked profile matches');
            });
        }
        profile.save(err => {
            if (err) throw new Error('Can\'t update active user profile')
        });
        res.status(201).json({success: true, message: 'Like saved', data: null});
    }
    catch (err) {
        const message = err.toString();
        const response = {success: false, message: message, data: null}
       res.status(401).json(response);
    }
});

// validate
// post profie
// list profile in area
// .env
module.exports = router;

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { UserProfileModel, MessageModel } = require('../models/schemas');

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
            const data = {};
            ['user_id', 'displayName', 'gender', 'interest', 'bio', 'birthDate', 'pics'].forEach(prop => data[prop] = obj[prop]);
            console.log(`data=${data} ${JSON.stringify(data)}`);
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
            res.status(204).json({sucess: false, messages: 'Can\'t get deck', data: null});
            return ;
        }
        const likes = obj.likes;
        const pass = obj.pass;
        console.log('Passed profile=', pass);
        console.log('Liked profiles=', likes);

        UserProfileModel.find({$and: [ {user_id: { $ne: req.user } }, { user_id: { $nin: likes } }, { user_id: {$nin: pass }} ]}, (err, obj) => {
            obj.forEach(user => console.log(user.user_id))
            if (err) {
                res.status(204).json({sucess: false, messages: 'user profiles not found', data: null});
            } else {
                res.status(201).json({success: true, message: 'found user profiles', data: obj})
            }
        });
    });
});

router.get('/getMatches', async (req, res) => {
    console.log('/getMatches');
    console.log('/getMatches');
    try {
        const profile = await UserProfileModel.findOne({ user_id: req.user });
        if (!profile) {
            throw new Error('Can\'t find active user profile');
        }
        const liked_profiles = await UserProfileModel.find({user_id: { '$in': profile.likes }, likes: { '$in': profile.user_id }});
        console.log('yo!', liked_profiles.length);
        res.status(201).json({success: true, message: 'Matches successfully retrieved', data: liked_profiles})
    }
    catch (err) {
        console.log('/getMatches error')
        const message = err.toString();
        const response = {success: false, message: message, data: null}
       res.status(204).json(response);
    }
});

router.post('/sendPass', async (req, res) => {
    console.log('/sendPass');
    try {
        const profile = await UserProfileModel.findOne({ user_id: req.user });
        if (!profile) {
            throw new Error('Can\'t find active user profile');
        }
        const pass = new Set(profile['pass']);
        pass.add(req.body.user_id);
        console.log(pass)
        profile['pass'] = Array.from(pass);
        await profile.save(err => {
            if (err) throw new Error('Can\'t update active user profile')
        });
        res.status(201).json({success: true, message: 'Passed profile saved', data: null});
    }
    catch (err) {
        const message = err.toString();
        console.log(err)
        const response = {success: false, message: message, data: null}
        res.status(204).json(response);
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
        profile.save(err => {
            if (err) throw new Error('Can\'t update active user profile')
        });
        const likedProfile = await UserProfileModel.findOne({ user_id: req.body.user_id});
        if (likedProfile.likes.includes(req.user)) {
            res.status(201).json({success: true, message: 'Match', data: null});
        }
        else {
            res.status(201).json({success: true, message: 'Like saved', data: null});
        }
    }
        catch (err) {
        const message = err.toString();
        console.log(err)
        const response = {success: false, message: message, data: null}
        res.status(204).json(response);
    }
});

router.get('/fetchMessages', async (req, res) => {
    console.log('/fetchMessages');
    try {
        const messages = await MessageModel.find({$or: [ {from: req.user}, {to: req.user}]});
        if (messages.length) {
            res.status(201).json({success: true, message: 'Messages retreived', data: messages})
        }
        else {

        }
    }
    catch (err) {
        res.status(401).json({success: false, message: err.toString(), data: null});
    }
});

// validate
// post profie
// list profile in area
// .env
module.exports = router;

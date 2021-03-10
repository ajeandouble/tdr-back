const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    user_id: { 
        type: String,
        required: true
    },
    email: {
        type: String,   
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    }
});

const UserProfileSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    interest: {
        type: String,
        required: true,
    },
    birthDate: {
        type: String,
        required: true
    },
    bio: {
        type: String
    },
    pics: {
        type: Array,
    },
    likes: {
        type: Array,
    },
    pass: {
        type: Array,
    }
});

const MessageSchema = new mongoose.Schema({
    from: {
        type: String
    },
    to: {
        type: String
    },
    message: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const schemas = {
    UserModel: mongoose.model('User', UserSchema, 'users'),
    UserProfileModel: mongoose.model('UserProfile', UserProfileSchema, 'users.profiles'),
    MessageModel: mongoose.model('Message', MessageSchema, 'messages'),
}

module.exports = schemas;
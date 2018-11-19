const mongoose = require('mongoose');
const Member = require('./member');

const TeamSchema = new mongoose.Schema({
    name: String
});

TeamSchema.methods.getMembers = function() {
    return Member.find({team: this});
};

const _self = TeamSchema.statics;

module.exports = mongoose.model('Team', TeamSchema);
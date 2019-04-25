const mongoose = require('mongoose');
const {Member, MemberSchema} = require('./member');

const TeamSchema = new mongoose.Schema({
    name: String,
    representative: {
        type: MemberSchema,
        required: false
    }
});

TeamSchema.methods.getMembers = function() {
    return Member.find({team: this});
};

TeamSchema.methods.getMemberById = function(id) {
    return Member.findById(id);
};

module.exports = mongoose.model('Team', TeamSchema);

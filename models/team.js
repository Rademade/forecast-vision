const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: String
});

const _self = TeamSchema.statics;

module.exports = mongoose.model('Team', TeamSchema);
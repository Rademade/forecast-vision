const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: String,
    nameOptions: Array,
    togglId: String,
    forecastId: String
});


module.exports = mongoose.model('Project', ProjectSchema);
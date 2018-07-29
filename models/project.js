const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: String,
    nameOptions: Array,
    togglId: String,
    forecastId: String
});

const _self = ProjectSchema.statics;

/**
 * @param {TogglReportProject} togglProject
 */
_self.getByTogglProject = (togglProject) => {
    return new Promise((resolve) => {
        mongoose.model('Project')
            .findOne({$or: [
                {name: togglProject.getName()}
            ]})
            .exec()
            .then((document) => {
                if (!document) document = _self.createByTogglProject(togglProject);
                resolve(document);
            }).catch((e) => {
                console.log('Error project find', e);
                resolve( _self.createByTogglProject(togglProject) );
            });
    });
};

/**
 * @param {TogglReportProject} togglProject
 * @return {Model}
 */
_self.createByTogglProject = (togglProject) => {
    let member = new (mongoose.model('Project'));
    member.set({
        name: togglProject.getName(),
    }).save();
    return member;
};


module.exports = mongoose.model('Project', ProjectSchema);
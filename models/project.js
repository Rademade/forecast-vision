const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: String,
    togglId: String,
    forecastCompanyId: String
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
                if (!document) {
                    _self.createByTogglProject(togglProject).then((document) => { resolve(document) });
                } else {
                    resolve(document);
                }
            });
    });
};

/**
 * @param {TogglReportProject} togglProject
 * @return {Model}
 */
_self.createByTogglProject = (togglProject) => {
    let member = new (mongoose.model('Project'));
    return member.set({
        name: togglProject.getName(),
    }).save();
};

/**
 * @param {ForecastAllocationItem} forecastItem
 */
_self.getByForecastAllocation = (forecastItem) => {
    return new Promise((resolve) => {
        mongoose.model('Project')
            .findOne({$or: [
                    {forecastCompanyId: forecastItem.getProjectId()},
                    {name: forecastItem.getProjectName()}
                ]})
            .exec()
            .then((document) => {
                if (!document) {
                    _self.createByForecastAllocation(forecastItem).then((document) => { resolve(document) });
                } else {
                    resolve(document);
                }
            });
    }).then((project) => {
        if (!project.forecastCompanyId) {
            project.set({forecastCompanyId: forecastItem.getProjectId()}).save();
        }
        return project;
    });
};

/**
 * @param {ForecastAllocationItem} forecastItem
 * @return {Model}
 */
_self.createByForecastAllocation = (forecastItem) => {
    let project = new (mongoose.model('Project'))
    return project.set({
        name: forecastItem.getProjectName(),
        forecastCompanyId: forecastItem.getProjectId()
    }).save();
};


module.exports = mongoose.model('Project', ProjectSchema);
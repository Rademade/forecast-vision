const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: String,
    togglName: String,
    togglId: Number,
    forecastCompanyId: Number
});

const _self = ProjectSchema.statics;

/**
 * @param {TogglReportProject} togglProject
 */
_self.getByTogglProject = (togglProject) => {
    return new Promise((resolve) => {
        mongoose.model('Project')
            .findOne({$or: [
                {name: togglProject.getName()},
                {togglName: togglProject.getName()}
            ]})
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
    return (new (mongoose.model('Project'))).set({
        name: togglProject.getName(),
        togglName: togglProject.getName(),
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
    return (new (mongoose.model('Project'))).set({
        name: forecastItem.getProjectName(),
        forecastCompanyId: forecastItem.getProjectId()
    }).save();
};

_self.buildByTogglProjectData = (data) => {
    mongoose.model('Project')
        .findOne({$or: [
            {togglId: data.id},
            {name: data.name},
            {togglName: data.name}
        ]})
        .then((document) => {
            if (!document) {
                (new (mongoose.model('Project'))).set({
                    togglId: data.id,
                    name: data.name,
                    togglName: data.name,
                }).save();
            } else {
                document.set({
                    togglId: data.id,
                    togglName: data.name
                }).save();
            }
        });
};


_self.findReportsReady = () => {
    return mongoose.model('Project').find({
        togglId: { $ne: null },
        forecastCompanyId:{ $ne: null }
    });
};

module.exports = mongoose.model('Project', ProjectSchema);
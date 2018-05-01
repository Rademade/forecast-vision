const _ = require('lodash');

const { TogglReportProject } = require('./report-project');

class TogglReportProjectList {

    constructor() {
        this.projects = {};
    }

    /**
     * @return {TogglReportProject[]}
     */
    getProjects() {
        return _.values( this.projects );
    }

    findOrCreate(name) {
        if (!this.projects[name]) {
            this.projects[name] = new TogglReportProject(name);
        }
        return this.projects[name];
    }

}

exports.TogglReportProjectList = TogglReportProjectList;
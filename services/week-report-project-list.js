const _ = require('lodash');

const { WeekReportProject } = require('./week-report-project');
const { ReportAllocation } = require('./report-allocation');

class WeekReportProjectList {

    constructor() {
        this.projects = {};
    }

    /**
     *
     * @param {ReportAllocation} allocation
     * @param {DateRange} matchedRange
     */
    addAllocation(allocation, matchedRange) {
        let projectAlias = allocation.getProjectName();
        let project = this.projects[ projectAlias ];
        if (!project) {
            project = new WeekReportProject(allocation.getProjectName(), allocation.isBillable());
            this.projects[ projectAlias ] = project;
        }
        project.addDuration( allocation.getDurationByRange(matchedRange) );
    }


    /**
     * @returns {WeekReportProject[]}
     */
    getAllProjects() {
        return _.values(this.projects);
    }

    /**
     * @return {WeekReportProject[]}
     */
    getBillableProjects() {
        return this.getAllProjects().filter((project) => {
            return project.isBillable();
        });
    }

    /**
     * @returns {Number}
     */
    getBillableCount() {
        return this.getBillableProjects().length;
    }

    getSortedProjects() {
        return _.sortBy(this.getAllProjects(), (project) => {
            return project.isBillable();
        }, (project) => {
            return project.getName();
        })
    }

}

exports.WeekReportProjectList = WeekReportProjectList;
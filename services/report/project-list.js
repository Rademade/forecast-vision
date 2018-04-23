const _ = require('lodash');

const { ReportProject } = require('./project');
const { Duration } = require('../duration');

class ReportProjectList {

    constructor() {
        this.projects = {};
    }

    /**
     *
     * @param {ForecastAllocationItem} allocation
     * @param {DateRange} matchedRange
     */
    addAllocation(allocation, matchedRange) {
        let projectAlias = allocation.getProjectName();
        let project = this.projects[ projectAlias ];
        if (!project) {
            project = new ReportProject(allocation.getProjectName(), allocation.isBillable());
            this.projects[ projectAlias ] = project;
        }
        project.addDuration( allocation.getDurationByRange(matchedRange) );
    }


    /**
     * @returns {ReportProject[]}
     */
    getAllProjects() {
        return _.values(this.projects);
    }

    /**
     * @return {ReportProject[]}
     */
    getBillableProjects() {
        return this.getAllProjects().filter((project) => {
            return project.isBillable();
        });
    }

    /**
     * @return {Duration}
     */
    getBillableDuration() {
        return this.getBillableProjects().reduce((a, b) => {
            return a.add( b.getTotalDuration() );
        }, new Duration());
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

exports.ReportProjectList = ReportProjectList;
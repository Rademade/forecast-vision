const _ = require('lodash');

const { ReportProject } = require('./project');
const { CollectionList } = require('./collection/list');
const { TogglReportProject } = require('./../toggl/report-project');
const { Duration } = require('../duration');

class ReportProjectList extends CollectionList {

    /**
     * @param {ReportProject} project
     * @return ReportProject
     */
    addProject(project) {
        return this.addItem(project);
    }

    /**
     *
     * @param {ForecastAllocationItem} allocation
     * @param {DateRange} matchedRange
     */
    addAllocation(allocation, matchedRange) {
        let projectAlias = allocation.getProjectName();
        let project = this.items[ projectAlias ];
        if (!project) {
            project = new ReportProject(allocation.getProjectName(), allocation.isBillable(), TogglReportProject.initNull(), null);
            this.addProject( project );
        }
        project.addDuration( allocation.getDurationByRange(matchedRange) );
    }


    /**
     * @returns {ReportProject[]}
     */
    getAllProjects() {
        return _.values(this.items);
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

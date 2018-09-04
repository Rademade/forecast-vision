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
     * @param {ForecastAllocationItemMatch} matchedItem
     */
    addMatchedAllocationItem(matchedItem) {
        let projectAlias = matchedItem.getAllocation().getProjectName();
        let project = this.items[ projectAlias ];
        if (!project) {
            console.log('Project ' + projectAlias + ' not founded');
        }
        project.addDuration( matchedItem.getDuration() );
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

    /**
     * @param {ReportProject} project
     */
    isExist(project) {
        return _.findIndex(this.getAllProjects(), (p) =>{
            return project.isSame(p);
        }) !== -1;
    }

}

exports.ReportProjectList = ReportProjectList;

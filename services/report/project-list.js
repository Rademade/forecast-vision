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
            project = new ReportProject(allocation.getProjectName(), allocation.isBillable(), TogglReportProject.initNull());
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

    _getItemsGroups() {
        // TODO extract to config file
        return [
            ['IIB (iib.com.ua)', 'IIB.com.ua'],
            ['CashTime', 'Cashtime'],
            ['doxy.me', 'Doxy.me'],
            ['A2 Invest', 'A2 Invest (CRM)'],
            ['Shift planner.GCCS', 'GCCS'],
            ['TradingIdea', 'TraidingIdea'],
            ['Thrillism', 'Thrilism'],
            ['СЛУХ', 'SLUH'],
            ['HeavyTrack', 'Heavy Track'],
            ['Vticket', 'V-Ticket'],
            ['PingPong. Support', 'Ping-pong — поддержка'],
            ['GroupTravel', 'Group travel'],
            ['TheHub', 'Recruiting Hub'],
            ['MonArome', 'Monarome'],
            ['Growthtribe.io', 'Growthtribe']

        ];
    }

}

exports.ReportProjectList = ReportProjectList;

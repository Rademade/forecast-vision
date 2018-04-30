const _ = require('lodash');

const { ReportProject } = require('./project');
const { Duration } = require('../duration');

class ReportProjectList {

    constructor() {
        this.projects = {};
    }


    /**
     * @param {ReportProject} project
     * @return ReportProject
     */
    addProject(project) {
        let projectAlias = project.getName();
        this.projects[ projectAlias ] = project;
        return project;
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
            project = this.addProject( new ReportProject(allocation.getProjectName(), allocation.isBillable()) );
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

    groupSimilar() {
        // TODO extract to config file
        let projectGroups = [
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
            ['TheHub', 'Recruiting Hub']
        ];

        projectGroups.forEach((projectGroup) => {
            let baseProject;

            for (let i = 0; i < projectGroup.length; i++) {

                if (!baseProject) {
                    baseProject = this.projects[projectGroup[i]];
                }

                let groupProject = this.projects[projectGroup[i]];

                // Don't group same project
                if (baseProject && groupProject && !baseProject.isSame(groupProject)) {
                    baseProject.groupWith( groupProject );
                    delete this.projects[projectGroup[i]];
                }
            }
        });
    }

}

exports.ReportProjectList = ReportProjectList;

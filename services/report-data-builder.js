const moment = require('moment');
const _ = require('lodash');

const { ReportData } = require('./report-data');


const { ReportProject } = require('./report/project');
const { ReportMember } = require('./report/member');
const { ReportMembersList } = require('./report/members-list');
const { ReportProjectList } = require('./report/project-list');

const { TogglReport } = require('./toggl/report');
const { TogglReportUser } = require('./toggl/report-user');
const { TogglReportProject } = require('./toggl/report-project');

const { ForecastReportMember } = require('./forecast/report-member');
const { ForecastAllocationList } = require('./forecast/allocation/list');

const { Member } = require('./../models/member');
const ProjectModel = require('./../models/project');

class ReportDataBuilder {

    /**
     * @param startDate
     * @param endDate
     * @param {Array<ForecastReportMember>} forecastMembers
     * @param {ForecastAllocationList} allocationReport
     * @param {TogglReport} togglReport
     */
    constructor(startDate, endDate, forecastMembers, allocationReport, togglReport) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.range = moment.range(startDate, endDate);
        this.allocationReport = allocationReport;
        this.togglReport = togglReport;
        this.forecastMembers = forecastMembers;
    }

    /**
     * @return {Promise<ReportData>}
     */

    async getReport() {
        const reportMemberList = await this.getReportMemberList();
        const reportProjectList = await this.getReportProjectList();

        return new ReportData(this.startDate, this.endDate, reportMemberList, reportProjectList, this.allocationReport);
    }



    /**
     * @Desc 1 - collect toggle reports
     *       2 - collect forecast reports
     *       3 - merge reportMembers
     *       4 - setMatchedAllcoations
     *       5 - return and enjoy
     * @return {Promise<ReportMembersList>}
     */
    async getReportMemberList() {
        let mergedListClass = new ReportMembersList();
        let togglMemberList = new ReportMembersList();
        let forecastMemberList = new ReportMembersList();

        for (let togglUser of this.togglReport.getUsersList().getUsers()) {
            let memberDocument = await Member.getByTogglUser(togglUser);
            togglMemberList.addMember(new ReportMember(
                memberDocument.name,
                '',
                0,
                togglUser,
                memberDocument
            ));
        }

        for (let forecastMember of this.forecastMembers) {
            let memberDocument = await Member.getByForecastUser(forecastMember);
            forecastMemberList.addMember(new ReportMember(
                memberDocument.name,
                forecastMember.getRoleName(),
                forecastMember.getAvailableMinutes(this.startDate, this.endDate),
                TogglReportUser.null(),
                memberDocument
            ));
        }

        for (let matchedItem of this.allocationReport.getMatchedAllocation(this.range)) {
            forecastMemberList.addMatchedAllocationItem( matchedItem );
        }

        /**
         * @desc merging is necessary only if toggleReport is presenting, forecast is always available
         */

        // TODO this logic it not clear. How to remove conditions for empty togglMemberList ?

        if (togglMemberList.getAllMembers().length > 0) {
            return mergedListClass.mergeMemberList(togglMemberList, forecastMemberList);
        } else {
            return forecastMemberList;
        }
    }

    /**
     * @return {Promise<ReportProjectList>}
     */
    async getReportProjectList() {
        let projectsCollection = new ReportProjectList();

        // Build projects from toggl side
        for (let togglProject of this.togglReport.getProjectsList().getProjects()) {
            let projectDocument = await ProjectModel.getByTogglProject(togglProject);
            let project = new ReportProject(togglProject.getName(), true, togglProject, projectDocument);
            projectsCollection.addProject( project );
        }

        // Add allocations
        for (let matchedItem of this.allocationReport.getMatchedAllocation(this.range)) {
            let allocation = matchedItem.getAllocation();
            let projectDocument = await  ProjectModel.getByForecastAllocation( allocation );
            let project = new ReportProject(allocation.getProjectName(), allocation.isBillable(), TogglReportProject.initNull(), projectDocument);
            projectsCollection.addProject( project );
            projectsCollection.addMatchedAllocationItem( matchedItem );
        }

        projectsCollection.groupSimilar();

        return projectsCollection;
    }

}

exports.ReportDataBuilder = ReportDataBuilder;

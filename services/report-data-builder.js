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
        this.dateRange = moment.range(startDate, endDate);
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
     * @return {Promise<ReportMembersList>}
     */
    async getReportMemberList() {
        let membersCollection = new ReportMembersList();

        for (let togglUser of this.togglReport.getUsersList().getUsers()) {
            let memberDocument = await Member.getByTogglUser(togglUser);
            membersCollection.addMember(new ReportMember(
                memberDocument.name,
                '',
                0,
                togglUser,
                memberDocument,
                this.range
            ));
        }

        for (let forecastMember of this.forecastMembers) {
            let memberDocument = await Member.getByForecastUser(forecastMember);
            membersCollection.addMember(new ReportMember(
                memberDocument.name,
                forecastMember.getRoleName(),
                forecastMember.getAvailableMinutes(this.startDate, this.endDate),
                TogglReportUser.null(),
                memberDocument,
                this.range
            ));
        }

        for (let matchedItem of this.allocationReport.getMatchedAllocation(this.range)) {
            membersCollection.addMatchedAllocationItem( matchedItem );
        }

        membersCollection.groupSimilar();

        return membersCollection;
    }

    /**
     * @return {Promise<ReportProjectList>}
     */
    async getReportProjectList() {
        let projectsCollection = new ReportProjectList();

        // Build projects from toggl side
        for (let togglProject of this.togglReport.getProjectsList().getProjects()) {
            let projectDocument = await ProjectModel.getByTogglProject(togglProject);
            let project = new ReportProject(togglProject.getName(), true, togglProject, projectDocument, this.dateRange);
            projectsCollection.addProject( project );
        }

        // Add allocations
        for (let matchedItem of this.allocationReport.getMatchedAllocation(this.range)) {
            let allocation = matchedItem.getAllocation();
            let projectDocument = await  ProjectModel.getByForecastAllocation( allocation );
            let project = new ReportProject(allocation.getProjectName(), allocation.isBillable(), TogglReportProject.initNull(), projectDocument, this.dateRange);
            projectsCollection.addProject( project );
            projectsCollection.addMatchedAllocationItem( matchedItem );
        }

        projectsCollection.groupSimilar();

        return projectsCollection;
    }

}

exports.ReportDataBuilder = ReportDataBuilder;

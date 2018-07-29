const moment = require('moment');

const { ReportData } = require('./report-data');


const { ReportProject } = require('./report/project');
const { ReportMember } = require('./report/member');
const { ReportMembersList } = require('./report/members-list');
const { ReportProjectList } = require('./report/project-list');

const { TogglReport } = require('./toggl/report');
const { TogglReportUser } = require('./toggl/report-user');
const { TogglReportProject } = require('./toggl/report-project');
const { ForecastAllocationList } = require('./forecast-allocation/list');

const MemberModel = require('./../models/member');
const ProjectModel = require('./../models/project');

class ReportDataBuilder {

    /**
     * @param startDate
     * @param endDate
     * @param utilizationWeekData
     * @param {ForecastAllocationList} allocationReport
     * @param {TogglReport} togglReport
     */
    constructor(startDate, endDate, utilizationWeekData, allocationReport, togglReport) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.range = moment.range(startDate, endDate);
        this.allocationReport = allocationReport;
        this.togglReport = togglReport;
        this.weekData = utilizationWeekData.data.viewer.component.unitilization;
    }

    /**
     * @return {Promise<ReportData>}
     */
    async getReport() {
        return new Promise((resolve, reject) => {
            Promise
                .all([this.getReportMemberList(), this.getReportProjectList()])
                .then((args) => {
                    let report = new ReportData(this.startDate, this.endDate, args[0], args[1], this.allocationReport);
                    resolve( report );
                }).catch((e) => {
                    console.log(e);
                });
        });
    }

    /**
     * @return {Promise<ReportMembersList>}
     */
    async getReportMemberList() {
        let membersList = new ReportMembersList();

        //Build members from toggl side
        for (let togglUser of this.togglReport.getUsersList().getUsers()) {
            let memberDocument = await MemberModel.getByTogglUser(togglUser)
            let member = new ReportMember(togglUser.getUserName(), '', 0, togglUser, memberDocument);
            membersList.addMember(member);
        }

        for (let item of this.weekData.utilizationListData) {
            let memberDocument = await MemberModel.getByForecastUser(item);
            let member = new ReportMember(item.name, item.roleName, item.availableMinutes, TogglReportUser.null(), memberDocument);
            membersList.addMember(member);
        }

        // Add allocations
        for (let matchedItem of this.allocationReport.getMatchedAllocation(this.range)) {
            membersList.addMatchedAllocationItem( matchedItem );
        }

        membersList.groupSimilar();

        return membersList;
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
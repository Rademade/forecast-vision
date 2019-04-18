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
        //FIXME add member only after adding matchedAlocation
        let mergedListClass = new ReportMembersList();
        let togglMemberList = new ReportMembersList();
        let forecastMemberList = new ReportMembersList();

        for (let togglUser of this.togglReport.getUsersList().getUsers()) {
            let memberDocument = await Member.getByTogglUser(togglUser);
            let member = new ReportMember(memberDocument.name, '', 0, togglUser, memberDocument);

            togglMemberList.addMemberWithoutGrouping(member);
        }

        for (let forecastMember of this.forecastMembers) {
            let memberDocument = await Member.getByForecastUser(forecastMember);
            let member = new ReportMember(
              memberDocument.name,
              forecastMember.getRoleName(),
              forecastMember.getAvailableMinutes(this.startDate, this.endDate),
              TogglReportUser.null(),
              memberDocument);

            forecastMemberList.addMemberWithoutGrouping(member);
        }

        let customMerge =((objValue, srcValue) => {
            if (!objValue) return srcValue;
            if (!srcValue) return objValue;

            objValue.setForecastAvailableDuration(srcValue.getForecastAvailableDuration());
            objValue.setDepartmentName(srcValue.getDepartmentName());

            return objValue
        });

        let mergedListObject = _.mergeWith(togglMemberList.getAllMembers(), forecastMemberList.getAllMembers(), customMerge);

        for (let [key, value] of Object.entries(mergedListObject)) {
            mergedListClass.addMemberWithoutGrouping(value)
        }

        // Add allocations
        for (let matchedItem of this.allocationReport.getMatchedAllocation(this.range)) {
            mergedListClass.addMatchedAllocationItem( matchedItem );
        }

        mergedListClass.groupSimilar();

        return mergedListClass;
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

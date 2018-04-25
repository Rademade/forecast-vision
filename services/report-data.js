const Moment = require('moment');
const { extendMoment } = require('moment-range');

const { ForecastAllocationList } = require('./forecast-allocation/list');
const { ReportProject } = require('./report/project');
const { ReportMember } = require('./report/member');
const { ReportMembersList } = require('./report/members-list');
const { ReportDepartment } = require('./report/department');
const { ReportProjectList } = require('./report/project-list');

const moment = extendMoment(Moment);


class ReportData {

    /**
     * @param {moment} startDate
     * @param {moment} endDate
     * @param {Object} utilizationWeekData
     * @param {ForecastAllocationList} allocations
     * @param {TogglReport} togglReport
     */
    constructor(startDate, endDate, utilizationWeekData, allocations, togglReport) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.range = moment.range(startDate, endDate);
        this.weekData = utilizationWeekData.data.viewer.component.unitilization;
        this.allocations = allocations;
        this.togglReport = togglReport;
    }

    getWeekNumber() {
        return this.startDate.isoWeek();
    }

    getRange() {
        return this.range;
    }

    isCurrentWeek() {
        return this.getWeekNumber() === moment().startOf('week').isoWeek();
    }


    getTotalCapacityDuration() {
        // This logic support over-planing hours
        return this.getPlannedDuration().clone().add( this.getUnplannedDuration() );
    }

    getPlannedDuration() {
        if (!this.plannedDuration) {
            this.plannedDuration = this.getMembersList().getPlannedDuration();
        }
        return this.plannedDuration;
    }

    getBillableDuration() {
        return this.getMembersList().getBillableDuration();
    }

    getInternalProcessDuration() {
        return this.allocations.getInternalProcessDuration(this.getRange());
    }

    getVacationDuration() {
        return this.allocations.getVacationDurations(this.getRange());
    }

    getUnplannedDuration() {
        return this.getMembersList().getUnplannedDuration();
    }

    /**
     * @returns {ReportMembersList}
     */
    getMembersList() {
        if (!this.membersList) {
            this.membersList = this._initMembers();
        }
        return this.membersList;
    }

    /**
     * @returns {ReportDepartment[]}
     */
    getDepartmentsList() {
        if (!this.departmentsList) {
            this.departmentsList = ReportDepartment.buildDepartments(this.getMembersList());
        }
        return this.departmentsList;
    }

    /**
     * @returns {ReportProjectList}
     */
    getProjectList() {
        if (!this.projectList) {
            this.projectList = this._initProjects();
        }
        return this.projectList;
    }

    // // //
    // PERCENT BLOCK
    // // //

    getPlannedPercent() {
        return this.getPlannedDuration().getRatio( this.getTotalCapacityDuration() );
    }

    getBillablePercent() {
        return this.getBillableDuration().getRatio( this.getTotalCapacityDuration() );
    }

    getVacationPercent() {
        return this.getVacationDuration().getRatio( this.getTotalCapacityDuration() );
    }

    getInternalProcessPercent() {
        return this.getInternalProcessDuration().getRatio( this.getTotalCapacityDuration() );
    }

    getUnplannedPercent() {
        return this.getUnplannedDuration().getRatio( this.getTotalCapacityDuration() );
    }

    // // //
    // PRIVATE
    // // //


    _initMembers() {
        let members = this.weekData.utilizationListData.map((memberData) => {
            let member = new ReportMember(memberData);
            // TODO add member from toggl side
            // TODO group duplicated values
            member.addTogglReport( this.togglReport.findUserReportByName(member.getName()) );
            return member;
        });

        let membersList = new ReportMembersList(members);

        this.allocations.matchAllocations(this.getRange(), (allocation, matchedRange) => {
            membersList.addAllocation( allocation, matchedRange );
        });

        return membersList;
    }

    _initProjects() {
        let projectsCollection = new ReportProjectList();

        // Build projects from toggl side
        this.togglReport.getProjectsList().getProjects().forEach((project) => {
            projectsCollection.addProject( new ReportProject(project.getName(), true) );
        });

        // Add forecast allocations
        this.allocations.matchAllocations(this.getRange(), (allocation, matchedRange) => {
            projectsCollection.addAllocation( allocation, matchedRange );
        });

        // Add toggl report to partical project
        projectsCollection.getAllProjects().forEach((project) => {
            project.addTogglReport( this.togglReport.findProjectReportByName(project.getName()) );
        });

        projectsCollection.groupSimilar();

        return projectsCollection;
    }


}

exports.ReportData = ReportData;
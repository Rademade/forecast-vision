const Moment = require('moment');
const { extendMoment } = require('moment-range');

const { ForecastAllocationList } = require('./forecast-allocation/list');
const { ReportProject } = require('./report/project');
const { ReportMember } = require('./report/member');
const { ReportMembersList } = require('./report/members-list');
const { ReportDepartment } = require('./report/department');
const { ReportProjectList } = require('./report/project-list');
const { TogglReportUser } = require('./toggl/report-user');
const MemberModel = require('./../models/member');
const ProjectModel = require('./../models/project');

const moment = extendMoment(Moment);


/**
 * User store data
 * UnitilizationData / weekData
 *
 * {
 *  id: '',
 *  name: '',
 *  profilePictureId: null,
 *  profilePictureDefaultId: 5,
 *  roleName: '',
 *  availableMinutes: 2100,
 *  scheduledMinutes: 2100,
 *  scheduledNonProjectTimeMinutes: 0,
 *  scheduledProjectTimeMinutes: 2100,
 *  reported: 0
 *  }
 */

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
        // TODO extract additional service
        this.weekData = utilizationWeekData.data.viewer.component.unitilization;
        this.allocations = allocations;
        this.togglReport = togglReport;
    }

    getWeekNumber() {
        return this.startDate.isoWeek() + 1;
    }

    getMonthName() {
        return this.startDate.format('MMMM');
    }

    getRange() {
        return this.range;
    }

    isCurrentWeek() {
        return this.getWeekNumber() === (moment().startOf('week').isoWeek() + 1);
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
        //TODO refactor to async

        let membersList = new ReportMembersList();

        //Build members from toggl side
        this.togglReport.getUsersList().getUsers().forEach((togglUser) => {
            MemberModel.getByTogglUser(togglUser).then((memberDocument) => {
                let member = new ReportMember(togglUser.getUserName(), '', 0, togglUser, memberDocument);
                membersList.addMember(member);
            });
        });

        // Build member from utilization report
        this.weekData.utilizationListData.map((item) => {
            MemberModel.getByForecastUser(item).then((memberDocument) => {
                let member = new ReportMember(item.name, item.roleName, item.availableMinutes, TogglReportUser.null(), memberDocument);
                membersList.addMember(member);
            });
        });

        // Add allocations
        // this.allocations.matchAllocations(this.getRange(), (allocation, matchedRange) => {
        //     membersList.addAllocation( allocation, matchedRange );
        // });

        membersList.groupSimilar();

        return membersList;
    }

    _initProjects() {
        let projectsCollection = new ReportProjectList();

        // Build projects from toggl side
        this.togglReport.getProjectsList().getProjects().forEach((togglProject) => {
            let project = new ReportProject(togglProject.getName(), true, togglProject);
            projectsCollection.addProject( project );
        });

        // Add forecast allocations
        this.allocations.matchAllocations(this.getRange(), (allocation, matchedRange) => {
            projectsCollection.addAllocation( allocation, matchedRange );
        });

        projectsCollection.groupSimilar();

        return projectsCollection;
    }

}

exports.ReportData = ReportData;

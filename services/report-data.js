const Moment = require('moment');
const { extendMoment } = require('moment-range');

const { ReportTeam } = require('./report/team');
const { ReportDepartment } = require('./report/department');
const { ReportMembersList } = require('./report/members-list');
const { ReportProjectList } = require('./report/project-list');
const { ForecastAllocationList } = require('./forecast/allocation/list');

const moment = extendMoment(Moment);

class ReportData {


    /**
     * @param {moment} startDate
     * @param {moment} endDate
     * @param {ReportMembersList} memberList
     * @param {ReportProjectList} projectList
     * @param {ForecastAllocationList} allocations
     */
    constructor(startDate, endDate, memberList, projectList, allocations) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.range = moment.range(startDate, endDate);
        this.projectList = projectList;
        this.membersList = memberList;
        this.allocations = allocations;
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
        return this.getMembersList().getAvailableDuration();
    }

    getPlannedDuration() {
        return this.getMembersList().getPlannedDuration();
    }

    getBillableDuration() {
        return this.getMembersList().getBillableDuration();
    }

    /**
     * TODO rename getTotalLeaveDaysDuration
     * @returns {*}
     */
    getVacationDuration() {
        return this.getMembersList().getVacationDuration();
    }

    getUnplannedDuration() {
        return this.getMembersList().getUnplannedDuration();
    }

    /**
     * @returns {ReportMembersList}
     */
    getMembersList() {
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

    getTeamsList() {
        if (!this.teamsList) {
            this.teamsList = ReportTeam.buildTeams(this.getMembersList());
        }
        return this.teamsList;
    }

    /**
     * @returns {ReportProjectList}
     */
    getProjectList() {
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

    getUnplannedPercent() {
        return this.getUnplannedDuration().getRatio( this.getTotalCapacityDuration() );
    }


}

exports.ReportData = ReportData;

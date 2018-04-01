const Moment = require('moment');
const { extendMoment } = require('moment-range');

const { WeekReportDepartment } = require('./week-report-department');
const { WeekReportMembersList } = require('./week-report-members-list');
const { TimeRound } = require('./time-round');

const moment = extendMoment(Moment);


class WeekReportData {

    /**
     * @param {moment} startDate
     * @param {moment} endDate
     * @param {Object} utilizationWeekData
     * @param {ReportAllocationList} allocationReport
     */
    constructor(startDate, endDate, utilizationWeekData, allocationReport) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.range = moment.range(startDate, endDate);
        this.weekData = utilizationWeekData.data.viewer.component.unitilization;
        this.departments = null;
        this.allocationReport = allocationReport;
        this.membersList = WeekReportMembersList.buildMembers(this.weekData.utilizationListData);
        this.departments = WeekReportDepartment.buildDepartments(this.membersList);
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

    getMembersList() {
        return this.membersList;
    }

    getDepartmentsList() {
        return this.departments;
    }

    totalCapacityHours() {
        return TimeRound.minutesToHours( this.weekData.availableMinutesTotal );
    }

    plannedHours() {
        // return this.allocationReport.getPlannedHours(this.getRange());
        return TimeRound.minutesToHours( this.weekData.scheduledMinutesTotal );
    }

    plannedPercent() {
        return TimeRound.roundPercents(this.plannedHours() / this.totalCapacityHours(this.getRange()));
    }

    billedHours() {
        return TimeRound.roundHours( this.allocationReport.getBillableHours(this.getRange()) );
    }

    billablePercent() {
        return TimeRound.roundPercents(this.billedHours() / this.totalCapacityHours());
    }

    internalProcessHours() {
        return TimeRound.roundHours( this.allocationReport.getInternalProcessHours(this.getRange()));
    }

    internalProcessPercent() {
        return TimeRound.roundPercents(this.internalProcessHours() / this.totalCapacityHours());
    }

    vacationHours() {
        return TimeRound.roundHours( this.allocationReport.getVacationHours(this.getRange()));
    }

    vacationPercent() {
        return TimeRound.roundPercents(this.vacationHours() / this.totalCapacityHours());
    }

    benchHours() {
        return TimeRound.roundHours( this.totalCapacityHours() - this.plannedHours() );
    }

    benchPercent() {
        return TimeRound.roundPercents(this.benchHours() / this.totalCapacityHours());
    }

}

exports.WeekReportData = WeekReportData;
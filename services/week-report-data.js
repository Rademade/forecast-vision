const moment = require('moment');

const { WeekReportDepartment } = require('./week-report-department');
const { WeekReportMembersList } = require('./week-report-members-list');

const { TimeRound } = require('./time-round');

class WeekReportData {

    constructor(startDate, endDate, weekData) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.weekData = weekData.data.viewer.component.unitilization;
        this.departments = null;
        this.membersList = WeekReportMembersList.buildMembers(this.weekData.utilizationListData);
        this.departments = WeekReportDepartment.buildDepartments(this.membersList);
    }

    getWeekNumber() {
        return this.startDate.isoWeek();
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
        return TimeRound.minutesToHours( this.weekData.scheduledMinutesTotal );
    }

    plannedPercent() {
        return TimeRound.roundPercents(this.plannedHours() / this.totalCapacityHours());
    }

    billedHours() {
        // TODO need projects info
        return '?'
    }

    billablePercent() {
        // TODO need projects info
        return '?'
    }

    internalProcessHours() {
        // TODO need projects info
        return '?'
    }

    internalProcessPercent() {
        // TODO need projects info
        return '?'
    }

    vacationHours() {
        // TODO need projects info
        return '?'
    }

    vacationPercent() {
        // TODO need projects info
        return '?'
    }

    benchHours() {
        return TimeRound.roundHours( this.totalCapacityHours() - this.plannedHours() );
    }

    benchPercent() {
        return TimeRound.roundPercents(this.benchHours() / this.totalCapacityHours());
    }

}

exports.WeekReportData = WeekReportData;
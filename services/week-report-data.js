const moment = require('moment');
const { WeekReportMember } = require('./week-report-member');

class WeekReportData {

    constructor(startDate, endDate, weekData) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.weekData = weekData.data.viewer.component.unitilization;
        this.members = this.weekData.utilizationListData.map((memeberData) => {
            return new WeekReportMember(memeberData);
        });
    }

    getWeekNumber() {
        return this.startDate.isoWeek();
    }

    isCurrentWeek() {
        return this.getWeekNumber() === moment().startOf('week').isoWeek();
    }

    totalCapacityHours() {
        return Math.round( this.weekData.availableMinutesTotal / 60 );
    }

    plannedHours() {
        return Math.round( this.weekData.scheduledMinutesTotal / 60 );
    }

    plannedPercent() {
        return this._round(this.plannedHours() / this.totalCapacityHours());
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
        return Math.round( this.totalCapacityHours() - this.plannedHours() );
    }

    benchPercent() {
        return this._round(this.benchHours() / this.totalCapacityHours());
    }

    _round(number) {
        return Math.round(number * 10000) / 100
    }

    getBadPlaningMembers() {
        return this.members.filter((member) => {
            return 1 < member.getBenchHours()&& member.getBenchHours() <= 14;
        });
    }

    getBenchMembers() {
        return this.members.filter((member) => {
            return 15 <= member.getBenchHours();
        });
    }

}

exports.WeekReportData = WeekReportData;
const { TimeRound } = require('./time-round');

const DEFAULT_ROLE = 'Unknown';

class WeekReportMember {
    constructor(data) {
        this.data = data
    }

    getName() {
        return this.data.name;
    }

    getRole() {
        return this.data.roleName || DEFAULT_ROLE;
    }

    getAvailableMinutes() {
        return this.data.availableMinutes;
    }

    getAvailableHours() {
        return TimeRound.minutesToHours( this.getAvailableMinutes() );
    }

    getScheduledMinutes() {
        return this.data.scheduledMinutes;
    }

    getScheduledHours() {
        return TimeRound.minutesToHours( this.getScheduledMinutes() );
    }

    getBenchMinutes() {
        return this.getAvailableMinutes() - this.getScheduledMinutes()
    }

    getBenchHours() {
        return TimeRound.minutesToHours( this.getBenchMinutes() );
    }

}

exports.WeekReportMember = WeekReportMember;
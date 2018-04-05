const { TimeRound } = require('./time-round');

class WeekReportProject {

    constructor(name, billable) {
        this.name = name;
        this.billable = billable;
        this.minutes = 0;
    }

    getName() {
        return this.name;
    }

    isBillable() {
        return this.billable;
    }

    addMinutes(minutes) {
        this.minutes += minutes;
    }

    getTotalMinutes() {
        return this.minutes;
    }

    getTotalHours() {
        return TimeRound.minutesToHours( this.getTotalMinutes() );
    }
}

exports.WeekReportProject = WeekReportProject;
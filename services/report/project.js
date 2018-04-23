const { Duration } = require('../duration');

class ReportProject {

    constructor(name, billable) {
        this.name = name;
        this.billable = billable;
        this.duration = new Duration(0);
    }

    getName() {
        return this.name;
    }

    isBillable() {
        return this.billable;
    }

    addDuration(duration) {
        this.duration.add( duration );
    }

    getTotalDuration() {
        return this.duration;
    }

}

exports.ReportProject = ReportProject;
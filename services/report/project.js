const { Duration } = require('../duration');
const { CollectionItem } = require('./collection/item');
const { TogglReportProject } = require('./../toggl/report-project')

class ReportProject extends CollectionItem {


    /**
     * @param name
     * @param billable
     * @param {TogglReportProject} togglFactReport
     */
    constructor(name, billable, togglFactReport) {
        super();
        this.name = name.trim();
        this.billable = billable;
        this.duration = new Duration(0);
        this.togglFactReport = togglFactReport;
    }

    /**
     * @return {TogglReportProject}
     */
    getTogglReport() {
        return this.togglFactReport;
    }

    getName() {
        return this.name;
    }

    getSlug() {
        return this.getName();
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

    getFactBillableDuration() {
        return this.getTogglReport().getBillableDuration();
    }

    getPlanningAccuracyPercent() {
        return this.getFactBillableDuration().getRatio( this.getTotalDuration() );
    }

    /**
     * @param {ReportProject} project
     */
    groupWith(project) {
        this.addDuration( project.getTotalDuration() );
        this.getTogglReport().groupWith( project.getTogglReport() );
    }

}

exports.ReportProject = ReportProject;
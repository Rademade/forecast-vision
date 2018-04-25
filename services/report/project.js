const { Duration } = require('../duration');
const { TogglReportProject } = require('./../toggl/report-project')

class ReportProject {

    constructor(name, billable) {
        this.name = name.trim();
        this.billable = billable;
        this.duration = new Duration(0);
    }

    /**
     * @param {TogglReportProject} togglFactReport
     */
    addTogglReport(togglFactReport) {
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
        return this.togglFactReport.getBillableDuration();
    }

    getPlanningAccuracyPercent() {
        return this.getFactBillableDuration().getRatio( this.getTotalDuration() );
    }

    /**
     * @param {ReportProject} project
     */
    isSame(project) {
        return project instanceof ReportProject && this.getName() === project.getName();
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
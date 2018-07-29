const { Duration } = require('../duration');
const { CollectionItem } = require('./collection/item');
const { TogglReportProject } = require('./../toggl/report-project')

class ReportProject extends CollectionItem {


    /**
     * @param name
     * @param billable
     * @param {TogglReportProject} togglFactReport
     * @param projectDocument
     */
    constructor(name, billable, togglFactReport, projectDocument) {
        super();
        this.name = name.trim();
        this.billable = billable;
        this.duration = new Duration(0);
        this.togglFactReport = togglFactReport;
        this.projectDocument = projectDocument;
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

    isSame(project) {
        return project instanceof ReportProject && this.projectDocument.id === project.projectDocument.id;
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
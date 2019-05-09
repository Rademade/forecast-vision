const { MomentRange } = require('moment-range');

const { Duration } = require('../duration');
const { CollectionItem } = require('./collection/item');
const { TogglReportProject } = require('./../toggl/report-project')

class ReportProject extends CollectionItem {

    /**
     * @param name
     * @param billable
     * @param {TogglReportProject} togglFactReport
     * @param projectDocument
     * @param {MomentRange} dateRange
     */
    constructor(name, billable, togglFactReport, projectDocument, dateRange) {
        super();
        this.name = name.trim();
        this.billable = billable;
        this.duration = new Duration(0);
        this.togglFactReport = togglFactReport;
        this.projectDocument = projectDocument;
        this.dateRange = dateRange;
    }

    /**
     * @return {TogglReportProject}
     */
    getTogglReport() {
        return this.togglFactReport;
    }

    getProjectDocument() {
        return this.projectDocument;
    }

    getName() {
        return this.name;
    }

    getSlug() {
        return this.getName();
    }

    getRange() {
        return this.dateRange;
    }

    getProjectType() {
        // TODO use current month days
        let multiplier = 1 / (this.getRange().diff('days') / 31);
        let monthDuration = this.getTotalDuration() * multiplier;

        switch (true) {
            case monthDuration >= 200: return ReportProject.PROJECT_TYPE_A;
            case monthDuration >= 100: return ReportProject.PROJECT_TYPE_B;
            case monthDuration >= 50: return ReportProject.PROJECT_TYPE_C;
            default: return ReportProject.PROJECT_TYPE_D;
        }
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

// Constants
ReportProject.PROJECT_TYPE_A = 1;
ReportProject.PROJECT_TYPE_B = 2;
ReportProject.PROJECT_TYPE_C = 3;
ReportProject.PROJECT_TYPE_D = 4;

exports.ReportProject = ReportProject;
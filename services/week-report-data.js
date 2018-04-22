const Moment = require('moment');
const { extendMoment } = require('moment-range');

const { WeekReportDepartment } = require('./week-report-department');
const { WeekReportMembersList } = require('./week-report-members-list');

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
        this.allocationReport = allocationReport;
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

    /**
     * @returns {WeekReportMembersList}
     */
    getMembersList() {
        if (!this.membersList) {
            this.membersList = WeekReportMembersList.buildMembersList(
                this.weekData.utilizationListData,
                this.allocationReport,
                this.getRange()
            );
        }
        return this.membersList;
    }

    /**
     * @returns {Array<WeekReportDepartment>}
     */
    getDepartmentsList() {
        if (!this.departmentsList) {
            this.departmentsList = WeekReportDepartment.buildDepartments(this.getMembersList());
        }
        return this.departmentsList;
    }

    getTotalCapacityDuration() {
        // This logic support over-planing hours
        return this.getPlannedDuration().clone().add( this.getUnplannedDuration() );
    }

    getPlannedDuration() {
        if (!this.plannedDuration) {
            this.plannedDuration = this.getMembersList().getPlannedDuration();
        }
        return this.plannedDuration;
    }

    getBillableDuration() {
        return this.getMembersList().getBillableDuration();
    }

    getInternalProcessDuration() {
        return this.allocationReport.getInternalProcessDuration(this.getRange());
    }

    getVacationDuration() {
        return this.allocationReport.getVacationDurations(this.getRange());
    }

    getUnplannedDuration() {
        return this.getMembersList().getUnplannedDuration();
    }

    /**
     * @returns {WeekReportProjectList}
     */
    getProjectList() {
        return this.allocationReport.getProjectList( this.getRange() );
    }

    // // //
    // PERCENT BLOCK
    // // //

    getPlannedPercent() {
        return this.getPlannedDuration().getRatio( this.getTotalCapacityDuration() );
    }

    getBillablePercent() {
        return this.getBillableDuration().getRatio( this.getTotalCapacityDuration() );
    }

    getVacationPercent() {
        return this.getVacationDuration().getRatio( this.getTotalCapacityDuration() );
    }

    getInternalProcessPercent() {
        return this.getInternalProcessDuration().getRatio( this.getTotalCapacityDuration() );
    }

    getUnplannedPercent() {
        return this.getUnplannedDuration().getRatio( this.getTotalCapacityDuration() );
    }

}

exports.WeekReportData = WeekReportData;
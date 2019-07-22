const _ = require('lodash');

const { Duration } = require('../duration');
const { CollectionItem } = require('./collection/item');

const NORMAL_BILLABLE_PERCENTAGE = 80;
const GOOD_ACCURACY = 95;

const FORECAST_VACATION_PROJECT_ID = 21;
const FORECAST_HOLIDAY_PROJECT_ID = 55;
const FORECAST_ABSENCE_PROJECT_ID = 105;

class ReportMember extends CollectionItem {
    /**
     * @param name
     * @param roleName
     * @param forcastAvailableMinutes
     * @param {TogglReportUser} togglFactReport
     * @param {Member} memberDocument
     */
    constructor(name, roleName, forcastAvailableMinutes = 0, togglFactReport, memberDocument) {
        super();
        this.userName = (name + '').trim();
        this.email = memberDocument.email || null;
        this.roleName = (roleName + '').trim();
        this.forecastAvailableDuration = new Duration(forcastAvailableMinutes);
        this.matchedAllocations = [];
        this.togglFactReport = togglFactReport;
        this.memberDocument = memberDocument;
    }

    isNormalBillableHours () {
        return this.getFactBillablePercent() >= NORMAL_BILLABLE_PERCENTAGE
    }

    isTasksWithoutProjects () {
        return this.togglFactReport.isTasksWithoutProjects()
    }

    isGoodAccuracy () {
        return this.getPlanningAccuracyPercent() > GOOD_ACCURACY
    }

    getName() {
        return this.userName
    }

    getEmail () {
        return this.email
    }

    getSlug() {
        return this.getName();
    }

    getDepartmentName() {
        return this.roleName;
    }

    getTeamName() {
        // TODO object type check
        if (this.memberDocument.team) {
            return this.memberDocument.team.name;
        }
        return null;
    }

    getMemberTogglId() {
        return this.memberDocument.togglId;
    }

    getForecastId() {
        return this.memberDocument.forecastId;
    }

    /**
     * @param {ForecastAllocationItemMatch} matchedItem
     */
    addMatchedAllocationItem(matchedItem) {
        this.matchedAllocations.push(matchedItem);
    }

    /**
     * @return {Array}
     */
    getMatchedAllocationsItems() {
        return this.matchedAllocations;
    }

    getTogglReport() {
        return this.togglFactReport;
    }

    hasDisplayHours() {
        return this.getPlannedDuration().getMinutes() > 0 ||
            this.getFactBillableDuration().getMinutes() > 0 ||
            this.getBillableDuration().getMinutes() > 0;
    }

    getForecastAvailableDuration() {
        return this.forecastAvailableDuration
    }

    getAvailableDuration() {
        if (this.availableDuration) return this.availableDuration;

        let percent = this.memberDocument.actualUtilization / 100;
        let minutes = this.getForecastAvailableDuration().clone().remove(this.getTotalLeaveDaysDuration()).getMinutes();

        this.availableDuration = new Duration( minutes * percent );

        return this.availableDuration;
    }

    getBillableDuration() {
        return this.getMatchedAllocationsItems().reduce((duration, item) => {
            return duration.add( item.getAllocation().isBillable() ? item.getDuration() : new Duration());
        }, new Duration());
    }

    getUnBillableDuration() {
        let unBillableDuration = this.getMatchedAllocationsItems().reduce((duration, item) => {
            return duration.add( !item.getAllocation().isBillable() ? item.getDuration() : new Duration());
        }, new Duration());

        unBillableDuration.remove( this.getTotalLeaveDaysDuration() );

        return unBillableDuration;
    }

    getTotalLeaveDaysDuration () {
        return this.getHolidaysDuration().clone().add(this.getAbsenceDuration());
    }

    /**
     * TODO add Unit tests
     *
     * Test 1
     * getAvailableDuration() + getTotalLeaveDaysDuration() ==
     * getBillableDuration() + getUnBillableDuration() + this.getUnplannedDuration() + getTotalLeaveDaysDuration();
     *
     * Test 2
     * getForecastAvailableDuration() == getAvailableDuration() + getUnplannedDuration()
     *
     */

    getAbsenceDuration () {
        let duration = this.getMatchedAllocationsItems().filter(item => {
            return item.allocation.allocationData.project.companyProjectId === FORECAST_ABSENCE_PROJECT_ID
        }).reduce((duration, item) => {
            return duration.add( item.getDuration() );
        }, new Duration());

        return duration ? duration : new Duration();
    }

    getHolidaysDuration() {
        let duration = this.getMatchedAllocationsItems().filter(item => {
            return _.includes(
                [FORECAST_HOLIDAY_PROJECT_ID, FORECAST_VACATION_PROJECT_ID],
                item.allocation.allocationData.project.companyProjectId
            );
        }).reduce((duration, item) => {
            return duration.add( item.getDuration() );
        }, new Duration());

        return duration ? duration : new Duration();
    }

    getBenchDuration() {
        return this.getUnBillableDuration().clone().add( this.getUnplannedDuration() );
    }

    getPlannedDuration() {
        return this.getBillableDuration().clone().add( this.getUnBillableDuration() );
    }

    getUnplannedDuration() {
        return this.getAvailableDuration().clone().remove( this.getPlannedDuration() );
    }

    getFactBillableDuration() {
        return this.getTogglReport().getBillableDuration();
    }

    getPlanningAccuracyPercent() {
        return this.getFactBillableDuration().getRatio( this.getBillableDuration() );
    }

    getPlanningBillablePercent () {
        return this.getBillableDuration().getRatio( this.getAvailableDuration() );
    }

    getFactBillablePercent () {
        return this.getFactBillableDuration().getRatio( this.getAvailableDuration() );
    }

    /**
     * @TODO Move to other service
     *
     * @param {ReportProject} project
     * @return boolean
     */
    hasWorkOnProject(project) {
        let found = false;

        for (let togglUserItem of this.getTogglReport().getItems()) {
            if (found ||
                togglUserItem.getProjectName() === project.getProjectDocument().name ||
                togglUserItem.getProjectName() === project.getProjectDocument().togglName) {
                found = true;
                break;
            }
        }

        for (let matchedItem of this.getMatchedAllocationsItems()) {
            let allocationProjectId = matchedItem.getAllocation().getProjectId();
            if (found || allocationProjectId === project.getProjectDocument().forecastCompanyId) {
                found = true;
                break;
            }
        }

        return found;
    }

    isSame(member) {
        return member instanceof ReportMember && this.memberDocument.id === member.memberDocument.id;
    }

    groupWith(member) {
        this.forecastAvailableDuration = member.getForecastAvailableDuration();

        if (this.getDepartmentName().length <= 0)   this.roleName = member.getDepartmentName();

        this.matchedAllocations =  member.getMatchedAllocationsItems();
        this.userName = this.getName() || member.getName();

        return this;
    }

}

exports.ReportMember = ReportMember;

const { Duration } = require('../duration');
const { CollectionItem } = require('./collection/item');

const NORMAL_BILLABLE_PERCENTAGE = 80;
const GODD_ACCURACY = 95;

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
        return this.getPlanningBillablePercent() >= NORMAL_BILLABLE_PERCENTAGE
    }

    isTasksWithoutProjects () {
        return this.togglFactReport.isTasksWithoutProjects()
    }

    isGoodAccuracy () {
        return this.getPlanningAccuracyPercent() > GODD_ACCURACY
    }

    isGoodFactReport () {
        return this.getFactBillablePercent() < NORMAL_BILLABLE_PERCENTAGE
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
        return this.getScheduledDuration().getMinutes() > 0 ||
            this.getFactBillableDuration().getMinutes() > 0 ||
            this.getBillableDuration().getMinutes() > 0;
    }

    getForecastAvailableDuration() {
        return this.forecastAvailableDuration
    }

    getAvailableDuration() {
        let leaveDays = this.getHolidaysDuration().add(this.getAbsenceDuration());

        if (!this.availableDuration) {
            let percent = this.memberDocument.actualUtilization / 100;

            this.availableDuration = new Duration( this.getForecastAvailableDuration().getMinutes() * percent );
            if (leaveDays.getMinutes() > 0) {
                this.availableDuration = this.availableDuration.remove(leaveDays)
            }
        }

        return this.availableDuration;
    }

    getScheduledDuration() {
        return this.getMatchedAllocationsItems().reduce((duration, item) => {
            return duration.add( item.getDuration() );
        }, new Duration());
    }

    getBillableDuration() {
        return this.getMatchedAllocationsItems().reduce((duration, item) => {
            return duration.add( item.getAllocation().isBillable() ? item.getDuration() : new Duration());
        }, new Duration());
    }

    getAbsenceDuration () {
        let absenceData = this.getMatchedAllocationsItems().filter(item => {
            return item.allocation.allocationData.project.companyProjectId === FORECAST_ABSENCE_PROJECT_ID
        })

        if (absenceData.length > 0) {
            return absenceData.reduce((duration, item) => {
                return duration.add( item.getDuration() );
            }, new Duration());
        } else {
            return new Duration()
        }
    }

    getHolidaysDuration() {
        let holidayData = this.getMatchedAllocationsItems().filter(item => {
            return item.allocation.allocationData.project.companyProjectId === FORECAST_HOLIDAY_PROJECT_ID
        })

        if (holidayData.length > 0) {
            return holidayData.reduce((duration, item) => {
                return duration.add( item.getDuration() );
            }, new Duration());
        } else {
            return new Duration()
        }
    }

    getBenchDuration() {
        //FIXME getAvailableDuration - getScheduledDuration + useLessProject()
        return this.getMatchedAllocationsItems().reduce((duration, item) => {
            return duration.add( item.getAllocation().isBenchProject() ? item.getDuration() : new Duration());
        }, this.getUnplannedDuration().clone());
    }

    getUnplannedDuration() {
        return this.getAvailableDuration().clone().remove( this.getScheduledDuration(), {min: 0} );
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
        this.userName = this.getName() || member.getName();
        this.roleName = this.getDepartmentName() || member.getDepartmentName();
        this.getAvailableDuration().add( member.getAvailableDuration() );
        this.getTogglReport().groupWith( member.getTogglReport() );

        // TODO add unique validation
        this.matchedAllocations = this.getMatchedAllocationsItems().concat( member.getMatchedAllocationsItems() );
    }

}

exports.ReportMember = ReportMember;

const { Duration } = require('../duration');
const { CollectionItem } = require('./collection/item');

const NORMAL_BILLABLE_PERCENTAGE = 80;

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
        return this.forecastAvailableDuration;
    }

    getAvailableDuration() {
        if (!this.availableDuration) {
            let percent = this.memberDocument.actualUtilization / 100;
            this.availableDuration = new Duration( this.getForecastAvailableDuration().getMinutes() * percent );
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

    getBenchDuration() {
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

const { Duration } = require('../duration');
const { CollectionItem } = require('./collection/item');

class ReportMember extends CollectionItem {


    /**
     * @param name
     * @param roleName
     * @param availableMinutes
     * @param {TogglReportUser} togglFactReport
     * @param {Member} memberDocument
     */
    constructor(name, roleName, availableMinutes = 0, togglFactReport, memberDocument) {
        super();
        this.userName = (name + '').trim();
        this.roleName = (roleName + '').trim();
        this.availableDuration = new Duration(availableMinutes);
        this.matchedAllocations = [];
        this.togglFactReport = togglFactReport;
        this.memberDocument = memberDocument;
    }

    getName() {
        return this.userName
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

    getAvailableDuration() {
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
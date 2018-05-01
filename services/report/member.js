const { Duration } = require('../duration');
const { CollectionItem } = require('./collection/item');
const { ForecastAllocationItem } = require('../forecast-allocation/item');

class ReportMember extends CollectionItem {


    /**
     * @param name
     * @param roleName
     * @param availableMinutes
     * @param {TogglReportUser} togglFactReport
     */
    constructor(name, roleName, availableMinutes = 0, togglFactReport) {
        super();
        this.userName = name.trim();
        this.roleName = roleName.trim();
        this.availableDuration = new Duration(availableMinutes);
        this.matchedAllocations = [];
        this.togglFactReport = togglFactReport;
    }

    getName() {
        return this.userName
    }

    getSlug() {
        return this.getName();
    }

    getRole() {
        return this.roleName;
    }

    /**
     * @param {ForecastAllocationItem} allocation
     * @param {DateRange} matchedRange
     */
    addAllocation(allocation, matchedRange) {
        this.matchedAllocations.push({
            allocation: allocation,
            range: matchedRange
        });
    }

    /**
     * @return {Array}
     */
    getMatchedAllocations() {
        return this.matchedAllocations;
    }

    getTogglReport() {
        return this.togglFactReport;
    }

    getAvailableDuration() {
        return this.availableDuration;
    }

    getScheduledDuration() {
        let duration = new Duration();
        this.matchedAllocations.forEach((data) => {
            duration.add( data.allocation.getDurationByRange(data.range) );
        });
        return duration;
    }

    getBillableDuration() {
        let duration = new Duration();
        this.matchedAllocations.forEach((data) => {
            if (data.allocation.isBillable()) {
                duration.add( data.allocation.getDurationByRange(data.range) );
            }
        });
        return duration;
    }

    getBenchDuration() {
        let duration = this.getUnplannedDuration().clone();
        this.matchedAllocations.forEach((data) => {
            if (data.allocation.isBenchProject()) {
                duration.add( data.allocation.getDurationByRange(data.range) );
            }
        });
        return duration;
    }

    getUnplannedDuration() {
        return this.getAvailableDuration().clone().remove( this.getScheduledDuration(), {min: 0} );
    }

    getFactBillableDuration() {
        return this.togglFactReport.getBillableDuration();
    }

    getPlanningAccuracyPercent() {
        return this.getFactBillableDuration().getRatio( this.getBillableDuration() );
    }

    groupWith(member) {
        this.userName = this.getName() || member.getName();
        this.roleName = this.getRole() || member.getRole();
        this.getAvailableDuration().add( member.getAvailableDuration() );
        this.getTogglReport().groupWith( member.getTogglReport() );

        // TODO add unique validation
        this.matchedAllocations = this.getMatchedAllocations().concat( member.getMatchedAllocations() );
    }

}

exports.ReportMember = ReportMember;
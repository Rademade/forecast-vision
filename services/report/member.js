const { Duration } = require('../duration');
const { ForecastAllocationItem } = require('../forecast-allocation/item');

const DEFAULT_ROLE = 'Unknown department';

class ReportMember {

    /**
     * {
     *  id: 'Q2FyZExpc3RDYXJkOjk0MDgz',
     *  name: 'Igor Zubkov',
     *  profilePictureId: null,
     *  profilePictureDefaultId: 5,
     *  roleName: 'Developer',
     *  availableMinutes: 2100,
     *  scheduledMinutes: 2100,
     *  scheduledNonProjectTimeMinutes: 0,
     *  scheduledProjectTimeMinutes: 2100,
     *  reported: 0,
     *  }
     * @param {Object} memberData
     */
    constructor(memberData) {
        this.userName = memberData.name.trim();
        this.roleName = memberData.roleName.trim();
        this.availableDuration = new Duration(memberData.availableMinutes);
        this.matchedAllocations = [];
    }

    getName() {
        return this.userName
    }

    getRole() {
        return this.roleName || DEFAULT_ROLE;
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
     * @param {TogglReportUser} togglFactReport
     */
    addTogglReport(togglFactReport) {
        this.togglFactReport = togglFactReport;
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

}

exports.ReportMember = ReportMember;
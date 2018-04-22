const { Duration } = require('./duration');

const DEFAULT_ROLE = 'Unknown department';

class WeekReportMember {

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
        this.id = memberData.id;
        this.userNmae = memberData.name;
        this.roleName = memberData.roleName;
        this.availableDuration = new Duration(memberData.availableMinutes);
        this.matchedAllocations = [];
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.userNmae
    }

    getRole() {
        return this.roleName || DEFAULT_ROLE;
    }

    /**
     * @param {ReportAllocation} allocation
     * @param {DateRange} matchedRange
     */
    addAllocation(allocation, matchedRange) {
        this.matchedAllocations.push({
            allocation: allocation,
            range: matchedRange
        });
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

}

exports.WeekReportMember = WeekReportMember;
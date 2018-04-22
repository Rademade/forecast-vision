const { ReportAllocation } = require('./report-allocation');
const { WeekReportProjectList } = require('./week-report-project-list');
const { Duration } = require('./duration');

class ReportAllocationList {

    /**
     * Data loaded from API scheduleQuery
     * https://app.forecast.it/scheduling
     *
     * @param {Object} allocationData
     */
    constructor(allocationData) {
        this.allocations = allocationData.data.viewer.company.allocations.edges.map((allocation) => {
            return new ReportAllocation(allocation.node);
        });
    }

    /**
     * @param {DateRange} rangeDates
     * @returns {WeekReportProjectList}
     */
    getProjectList(rangeDates) {
        let projectsCollection = new WeekReportProjectList();
        this.matchAllocations(rangeDates, (allocation, matchedRange) => {
            projectsCollection.addAllocation( allocation, matchedRange );
        });
        return projectsCollection;
    }

    getInternalProcessDuration(rangeDates) {
        let duration = new Duration();
        this.matchAllocations(rangeDates, (allocation, matchedRange) => {
            if (!allocation.isBillable()) {
                duration.add( allocation.getDurationByRange(matchedRange) );
            }
        });
        return duration.remove( this.getVacationDurations(rangeDates) );
    }

    getVacationDurations(rangeDates) {
        let duration = new Duration();
        this.matchAllocations(rangeDates, (allocation, matchedRange) => {
            if (allocation.isVacation()) {
                duration.add( allocation.getDurationByRange(matchedRange) );
            }
        });
        return duration;
    }

    /**
     * @param {DateRange} selectedRange
     * @param {Function} matchCallback
     */
    matchAllocations(selectedRange, matchCallback) {
        this.allocations.forEach((allocation) => {
            let matchedRange = selectedRange.intersect(allocation.getRange());
            if (matchedRange) {
                // TODO create new matched range object
                matchCallback(allocation, matchedRange);
            }
        });
    }

}

exports.ReportAllocationList = ReportAllocationList;
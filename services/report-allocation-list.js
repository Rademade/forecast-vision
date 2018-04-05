const { ReportAllocation } = require('./report-allocation');
const { WeekReportProjectList } = require('./week-report-project-list');
const { TimeRound } = require('./time-round');

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

    getPlannedHours(rangeDates) {
        let plannedHours = 0;
        this.matchAllocations(rangeDates, (allocation, matchedRange) => {
            plannedHours += allocation.getMinutesByRange(matchedRange);
        });
        return TimeRound.minutesToHours( plannedHours );
    }

    getBillableHours(rangeDates) {
        let billableHours = 0;
        this.matchAllocations(rangeDates, (allocation, matchedRange) => {
            if (allocation.isBillable()) {
                billableHours += allocation.getMinutesByRange(matchedRange);
            }
        });
        return TimeRound.minutesToHours( billableHours );
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

    getInternalProcessHours(rangeDates) {
        let internalProcessHours = 0;
        this.matchAllocations(rangeDates, (allocation, matchedRange) => {
            if (!allocation.isBillable()) {
                internalProcessHours += allocation.getMinutesByRange(matchedRange);
            }
        });
        return TimeRound.minutesToHours( internalProcessHours - this.getVacationHours(rangeDates) );
    }

    getVacationHours(rangeDates) {
        let vacationHours = 0;
        this.matchAllocations(rangeDates, (allocation, matchedRange) => {
            if (allocation.isVacation()) {
                vacationHours += allocation.getMinutesByRange(matchedRange);
            }
        });
        return TimeRound.minutesToHours( vacationHours );
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
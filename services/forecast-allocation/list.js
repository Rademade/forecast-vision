const { ForecastAllocationItem } = require('./item');
const { Duration } = require('../duration');

class ForecastAllocationList {

    /**
     * Data loaded from API scheduleQuery
     * https://app.forecast.it/scheduling
     *
     * @param {Object} allocationData
     */
    constructor(allocationData) {
        this.allocations = allocationData.data.viewer.company.allocations.edges.map((allocation) => {
            return new ForecastAllocationItem(allocation.node);
        });
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

exports.ForecastAllocationList = ForecastAllocationList;
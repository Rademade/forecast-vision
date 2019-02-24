const { ForecastAllocationItem } = require('./item');
const { ForecastAllocationItemMatch } = require('./item-match');
const { Duration } = require('../../duration');

class ForecastAllocationList {

    /**
     * Data loaded from API scheduleQuery
     * https://app.forecast.it/scheduling
     *
     * @param {Object} allocationData
     *
     * projectId – Forecast Project Id
     * @param {Object} filters
     */
    constructor(allocationData, filters = {}) {
        this.allocations = allocationData.data.viewer.company.allocations.edges.map((allocation) => {
            return new ForecastAllocationItem(allocation.node);
        }).filter((allocationItem) => {
            if (filters.length === 0)  return true;
            return (
                (!filters.projectId || (filters.projectId && filters.projectId === allocationItem.getProjectId()))
            )
        });
    }

    getInternalProcessDuration(rangeDates) {
        let duration = new Duration();
        for (let matchedItem of this.getMatchedAllocation(rangeDates)) {
            if (!matchedItem.getAllocation().isBillable()) {
                duration.add( matchedItem.getDuration() );
            }
        }
        return duration.remove( this.getVacationDurations(rangeDates) );
    }

    getVacationDurations(rangeDates) {
        let duration = new Duration();
        for (let matchedItem of this.getMatchedAllocation(rangeDates)) {
            if (matchedItem.getAllocation().isVacation()) {
                duration.add( matchedItem.getDuration() );
            }
        }
        return duration;
    }

    /**
     * @param selectedRange
     * @return {Array<ForecastAllocationItemMatch>}
     */
    getMatchedAllocation(selectedRange) {
        let matchedAllocations = [];
        for (let allocation of this.allocations) {
            let matchedRange = selectedRange.intersect(allocation.getRange());
            if (matchedRange) {
                matchedAllocations.push(new ForecastAllocationItemMatch(allocation, matchedRange));
            }
        }
        return matchedAllocations;
    }

}

exports.ForecastAllocationList = ForecastAllocationList;
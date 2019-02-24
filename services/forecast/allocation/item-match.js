const { Duration } = require('../../duration');

class ForecastAllocationItemMatch {

    /**
     * @param {ForecastAllocationItem} allocation
     * @param {DateRange} matchedRange
     */
    constructor(allocation, matchedRange) {
        this.allocation = allocation;
        this.matchedRange = matchedRange;
    }

    getAllocation() {
        return this.allocation;
    }

    getMatchedRange() {
        return this.matchedRange;
    }

    getDuration() {
        let days = 0;
        let start = this.getMatchedRange().start.clone();
        let end = this.getMatchedRange().end;

        while (start <= end) {
            //TODO matched current day with booked day. Accumulate summary
            if (!(
                (start.weekday() === 6) ||
                (start.weekday() === 0 )
            )) {
                ++days;
            } else {
                if (start.weekday() === 6 && this.getAllocation().hasWorkingSaturday()) {
                    console.error('Exist plan for saturday');
                    console.log(this.allocation.getInfo());
                }
                if (start.weekday() === 0 && this.getAllocation().hasWorkingSunday()) {
                    console.error('Exist plan for sunday');
                    console.log(this.allocation.getInfo());
                }
            }
            start.add(1, 'd');
        }

        return new Duration(days * this.getAllocation().getMinutesPerDay());
    }


}

exports.ForecastAllocationItemMatch = ForecastAllocationItemMatch;
const Moment = require('moment');
const { extendMoment } = require('moment-range');

const moment = extendMoment(Moment);

const VACATION_PORJECT_ID = 21;

class ReportAllocation {
    constructor(allocationData) {
        this.allocationData = allocationData;
        this.startDate = moment(new Date(allocationData.startYear, allocationData.startMonth - 1, allocationData.startDay));
        this.endDate = moment(new Date(allocationData.endYear, allocationData.endMonth - 1, allocationData.endDay));
        this.range = moment.range(this.getStartDate(), this.getEndDate());
    }

    getStartDate() {
        return this.startDate;
    }

    getEndDate() {
        return this.endDate;
    }

    getRange() {
        return this.range;
    }

    isBillable() {
        return this.allocationData.project.billable;
    }

    isVacation() {
        return this.allocationData.project.companyProjectId === VACATION_PORJECT_ID
    }

    getMinutesPerDay() {
        return this.allocationData.monday ||
            this.allocationData.tuesday ||
            this.allocationData.wednesday ||
            this.allocationData.thursday ||
            this.allocationData.friday ||
            this.allocationData.saturday ||
            this.allocationData.sunday;
    }

    /**
     * @param {DateRange} range
     */
    getMinutesByRange(range) {
        // TODO check
        let days = 0;
        let start = range.start.clone();

        while (start <= range.end) {
            if (!(
                (start.weekday() === 6 && this.allocationData.saturday === 0) ||
                (start.weekday() === 0 && this.allocationData.sunday === 0)
            )) {
                ++days;
            }
            start.add(1, 'd');
        }

        return days * this.getMinutesPerDay();
    }

}

exports.ReportAllocation = ReportAllocation;
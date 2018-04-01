const Moment = require('moment');
const { extendMoment } = require('moment-range');

const moment = extendMoment(Moment);

const VACATION_PROJECT_ID = 21;
const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

class ReportAllocation {
    constructor(allocationData) {
        this.allocationData = allocationData;
        this.startDate = moment(new Date(allocationData.startYear, allocationData.startMonth - 1, allocationData.startDay));
        this.endDate = moment(new Date(allocationData.endYear, allocationData.endMonth - 1, allocationData.endDay));
        this.range = moment.range(this.getStartDate(), this.getEndDate());
    }

    getAllocationInfo() {
        return 'User ' + this.allocationData.person.lastName + ' planed on project ' + this.allocationData.project.name;
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
        return this.allocationData.project.companyProjectId === VACATION_PROJECT_ID
    }

    getMinutesPerDay() {
        let previousMinutes = 0;
        for (let weekDay of WEEKDAYS) {
            if (this.allocationData[weekDay] > 0 && this.allocationData[weekDay] > previousMinutes) {
                // Additional debugging. Check for the same minutes summary
                if (previousMinutes > 0) {
                    console.error('One allocation has different time');
                    console.log(this.getAllocationInfo())
                }
                previousMinutes = this.allocationData[weekDay];
            }
        }
        return previousMinutes;
    }

    /**
     * @param {DateRange} range
     */
    getMinutesByRange(range) {
        let days = 0;
        let start = range.start.clone();

        while (start <= range.end) {
            //TODO matched current day with booked day. Accumulate summary
            if (!(
                (start.weekday() === 6) ||
                (start.weekday() === 0 )
            )) {
                ++days;
            } else {
                if (start.weekday() === 6 && this.allocationData.saturday > 0) {
                    console.error('Exist plan for saturday Total –' + this.allocationData.saturday);
                    console.log(this.getAllocationInfo());
                }
                if (start.weekday() === 0 && this.allocationData.sunday > 0) {
                    console.error('Exist plan for sunday. Total – ' + this.allocationData.sunday);
                    console.log(this.getAllocationInfo());
                }
            }
            start.add(1, 'd');
        }

        return days * this.getMinutesPerDay();
    }

}

exports.ReportAllocation = ReportAllocation;
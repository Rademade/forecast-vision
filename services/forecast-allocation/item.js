const Moment = require('moment');
const { extendMoment } = require('moment-range');

const moment = extendMoment(Moment);

const PROJECT_ID_VACATION = 21;

const PROJECT_ID_NEW_BIZ = 30;
const PROJECT_ID_PROCESSES = 10;
const PROJECT_ID_RECRUITMENT = 20;
const PROJECT_ID_TEAM_LEADING = 53;
const PROJECT_ID_HOLIDAY = 55;

const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

class ForecastAllocationItem {

    /**
     *  Allocation Data
     *
     * "id": "QWxsb2NhdGlvbjoxMjU3OA==",
     * "monday": 210,
     * "tuesday": 210,
     * "wednesday": 210,
     * "thursday": 210,
     * "friday": 210,
     * "saturday": 0,
     * "sunday": 0,
     * "startYear": 2018,
     * "startMonth": 1,
     * "startDay": 25,
     * "endYear": 2018,
     * "endMonth": 2,
     * "endDay": 7,
     * "description": null,
     * "project": {
     *  "id": "UHJvamVjdFR5cGU6ODUzNA==",
     *  "name": "Done - Hotel Booking (TransAvia)",
     *  "companyProjectId": 6,
     *  "billable": true
     * },
     * "person": {
     *  "id": "UGVyc29uOjc2NDE3",
     *  "userType": "NO_LOGIN",
     *  "firstName": "Alena",
     *  "lastName": "Panchenko"
     * }
     *
     * @param allocationData
     */
    constructor(allocationData) {
        this.allocationData = allocationData;
        this.startDate = moment(new Date(allocationData.startYear, allocationData.startMonth - 1, allocationData.startDay));
        this.endDate = moment(new Date(allocationData.endYear, allocationData.endMonth - 1, allocationData.endDay));
        this.range = moment.range(this.getStartDate(), this.getEndDate());
    }

    getInfo() {
        return 'User ' + this.getMemberName() + ' planed on project ' + this.allocationData.project.name;
    }

    getMemberName() {
        return [
            this.allocationData.person.firstName,
            this.allocationData.person.lastName
        ].join(' ').trim();
    }

    getProjectName() {
        return this.allocationData.project.name.trim();
    }

    getProjectId() {
        return this.allocationData.project.companyProjectId;
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
        return this.allocationData.project.companyProjectId === PROJECT_ID_VACATION
    }

    isUsefulProject() {
        return [
            PROJECT_ID_NEW_BIZ,
            // PROJECT_ID_PROCESSES,
            PROJECT_ID_RECRUITMENT,
            PROJECT_ID_TEAM_LEADING,
            PROJECT_ID_HOLIDAY
        ].indexOf( this.allocationData.project.companyProjectId ) !== -1;
    }

    isBenchProject() {
        return !(this.isBillable() || this.isUsefulProject() || this.isVacation());
    }

    hasWorkingSaturday() {
        return this.allocationData.saturday > 0;
    }

    hasWorkingSunday() {
        return this.allocationData.sunday > 0;
    }

    /**
     * @return {number}
     */
    getMinutesPerDay() {
        let previousMinutes = 0;
        for (let weekDay of WEEKDAYS) {
            if (this.allocationData[weekDay] > 0 && this.allocationData[weekDay] > previousMinutes) {
                // Additional debugging. Check for the same minutes summary
                if (previousMinutes > 0) {
                    console.error('One allocation has different time');
                    console.log(this.getInfo())
                }
                previousMinutes = this.allocationData[weekDay];
            }
        }
        return previousMinutes;
    }

}

exports.ForecastAllocationItem = ForecastAllocationItem;
const { Report } = require('./report');

const moment = require('moment');

/**
 * @TODO refactor end date and dates comparing
 */
class ReportFactory {

    static getWeeksRhythmReport() {
        let startDate = moment().subtract(1, 'weeks').startOf('week');
        // If we use endOf function we have 59 second
        let endDate = moment().add(6, 'weeks').startOf('week').subtract(1, 'day');

        return new Report(startDate, endDate, null, (startIntervalDate) => {
            return startIntervalDate.clone().add(1, 'week');
        });
    }

    static getWeeksFactReport() {
        let startDate = moment().subtract(3, 'weeks').startOf('week');
        // If we use endOf function we have 59 second
        let endDate = moment().add(1, 'week').startOf('week').subtract(1, 'day');

        return new Report(startDate, endDate, null, (startIntervalDate) => {
            return startIntervalDate.clone().add(1, 'week');
        });
    }

    static getCustomFactReport(dateStart, dateEnd, projectId) {
        // TODO toggl / forecast project
        let daysLength = dateEnd.diff(dateStart, 'days');
        // TODO Days validation

        return new Report(dateStart, dateEnd, projectId, (startIntervalDate) => {
            return startIntervalDate.clone().add(daysLength, 'day');
        });
    }

    static getMonthsReport() {
        let startDate = moment().subtract(1, 'months').startOf('month');
        // If we use endOf function we have 59 second
        let endDate = moment().add(2, 'month').startOf('month').subtract(1, 'day');

        return new Report(startDate, endDate, null, (startIntervalDate) => {
            return startIntervalDate.clone().add(1, 'month');
        });
    }

}

exports.ReportFactory = ReportFactory;
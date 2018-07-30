const { ReportLoader } = require('./report-loader');

const moment = require('moment');

/**
 * @TODO refactor end date and dates comparing
 */
class ReportLoaderFactory {

    static getWeeksRhythmReport() {
        let startDate = moment().startOf('week');
        // If we use endOf function we have 59 second
        let endDate = moment().add(6, 'weeks').startOf('week').subtract(1, 'day');

        return new ReportLoader(startDate, endDate, null, (startIntervalDate) => {
            return startIntervalDate.clone().add(1, 'week');
        });
    }

    static getWeeksFactReport() {
        let startDate = moment().subtract(3, 'weeks').startOf('week');
        // If we use endOf function we have 59 second
        let endDate = moment().add(1, 'week').startOf('week').subtract(1, 'day');

        return new ReportLoader(startDate, endDate, null, (startIntervalDate) => {
            return startIntervalDate.clone().add(1, 'week');
        });
    }

    /**
     * @param {moment} dateStart
     * @param {moment} dateEnd
     * @param {Project} projectDocument
     * @return {ReportLoader}
     */
    static getCustomFactReport(dateStart, dateEnd, projectDocument) {
        let daysLength = dateEnd.diff(dateStart, 'days');

        return new ReportLoader(dateStart, dateEnd, projectDocument, (startIntervalDate) => {
            return startIntervalDate.clone().add(daysLength, 'day');
        });
    }

    static getMonthReport(dateStart, dateEnd) {
        let daysLength = dateEnd.diff(dateStart, 'days');
        return new ReportLoader(dateStart, dateEnd, null, (startIntervalDate) => {
            return startIntervalDate.clone().add(daysLength, 'day');
        });
    }

    static getMonthsReport() {
        let startDate = moment().subtract(1, 'months').startOf('month');
        // If we use endOf function we have 59 second
        let endDate = moment().add(2, 'month').startOf('month').subtract(1, 'day');

        return new ReportLoader(startDate, endDate, null, (startIntervalDate) => {
            return startIntervalDate.clone().add(1, 'month');
        });
    }

}

exports.ReportLoaderFactory = ReportLoaderFactory;
const { ReportLoader } = require('./report-loader');

const moment = require('moment');

/**
 * @TODO refactor end date and dates comparing
 */
class ReportLoaderFactory {

    static async getWeeksRhythmReport() {
        let startDate = moment().startOf('week');
        // If we use endOf function we have 59 second
        let endDate = moment().add(6, 'weeks').startOf('week').subtract(1, 'day');

        return await new ReportLoader(startDate, endDate, null, (startIntervalDate) => {
            return startIntervalDate.clone().add(1, 'week');
        }).load();
    }

    static async getCurrentWeekReport() {
        let startDate = moment().startOf('week');
        // If we use endOf function we have 59 second
        let endDate = moment().add(2, 'weeks').startOf('week').subtract(1, 'day');

        return await new ReportLoader(startDate, endDate, null, (startIntervalDate) => {
            return startIntervalDate.clone().add(1, 'week');
        }).load();
    }

    static async getWeeksFactReport() {
        let startDate = moment().subtract(4, 'weeks').startOf('week');
        // If we use endOf function we have 59 second
        let endDate = moment().add(1, 'week').startOf('week').subtract(1, 'day');

        return await new ReportLoader(startDate, endDate, null, (startIntervalDate) => {
            return startIntervalDate.clone().add(1, 'week');
        }).load();
    }

    /**
     * @param {moment} dateStart
     * @param {moment} dateEnd
     * @param {Project} projectDocument
     * @return {ReportLoader}
     */
    static async getCustomFactReport(dateStart, dateEnd, projectDocument) {
        let daysLength = dateEnd.diff(dateStart, 'days');

        return await new ReportLoader(dateStart, dateEnd, projectDocument, (startIntervalDate) => {
            return startIntervalDate.clone().add(daysLength, 'day');
        }).load();
    }

    static async getCustomNotificationReport() {
        let startDate = moment().subtract(1, 'week').startOf('week');
        let endDate =   moment().add(2, 'weeks').startOf('week').subtract(1, 'day')

        return await new ReportLoader(startDate, endDate, null, (startIntervalDate) => {
            return startIntervalDate.clone().add(1, 'week');
        }).load();
    }

    static async getMonthReport(dateStart, dateEnd) {
        let daysLength = dateEnd.diff(dateStart, 'days');

        return await new ReportLoader(dateStart, dateEnd, null, (startIntervalDate) => {
            return startIntervalDate.clone().add(daysLength, 'day');
        }).load();
    }

    static async getReportByPrevMonthCount(monthCount) {
      if (monthCount < 6 || monthCount > 60) {
          return 'Invalid month count'
      }

      const dateEnd = moment().startOf('isoWeek'),
            dateStart = moment(dateEnd).subtract(monthCount, 'month');

      return await new ReportLoader(dateStart, dateEnd, null, (startIntervalDate) => {
          return startIntervalDate.clone().add(1, 'month');
      }).load();
    }

    static async getMonthsReport() {
        let startDate = moment().subtract(1, 'months').startOf('month');
        // If we use endOf function we have 59 second
        let endDate = moment().add(2, 'month').startOf('month').subtract(1, 'day');

        return await new ReportLoader(startDate, endDate, null, (startIntervalDate) => {
            return startIntervalDate.clone().add(1, 'month');
        }).load();
    }

}

exports.ReportLoaderFactory = ReportLoaderFactory;

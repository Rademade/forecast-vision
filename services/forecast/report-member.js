const moment = require('moment-weekdaysin');

class ForecastReportMember {

  /**
   * Data from GraphQL query – membersQuery
   * File scraping methods
   *
   * @param {Object} data
   */
  constructor(data) {
    this.data = data;
  }

  isActive() {
    return this.data.active;
  }

  getId() {
    return this.data.id;
  }

  getName() {
    return [this.data.firstName, this.data.lastName].join(' ');
  }

  getRoleName() {
    return this.data.role ? this.data.role.name : null;
  }

  getDaysInMonth(start, end, dayOfWeek) {
    let days = moment(start).weekdaysInBetween(end, dayOfWeek);

    return days.length
  }

  getAvailableMinutes(startDate, endDate) {
    const isDateRange = startDate && endDate
    // FIXME here build months matrix
    if (startDate && endDate) {
      let mondays = this.getDaysInMonth(startDate, endDate, 'Sunday');

      console.log(mondays.length)
    }

    return (this.data.monday * isDateRange ? this.getDaysInMonth(startDate, endDate, 'Monday') : 1) +
      (this.data.tuesday * isDateRange ? this.getDaysInMonth(startDate, endDate, 'Monday') : 1) +
      (this.data.wednesday * isDateRange ? this.getDaysInMonth(startDate, endDate, 'Monday') : 1) +
      (this.data.thursday * isDateRange ? this.getDaysInMonth(startDate, endDate, 'Monday') : 1) +
      (this.data.friday * isDateRange ? this.getDaysInMonth(startDate, endDate, 'Monday') : 1) +
      (this.data.saturday * isDateRange ? this.getDaysInMonth(startDate, endDate, 'Monday') : 1) +
      (this.data.sunday * isDateRange ? this.getDaysInMonth(startDate, endDate, 'Monday') : 1)
  }

}

exports.ForecastReportMember = ForecastReportMember;

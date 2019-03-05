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
    if (!start && !end) {
      return 1
    }

    let days = moment(start).weekdaysInBetween(end, dayOfWeek);

    return days.length
  }

  getAvailableMinutes(startDate, endDate) {
    console.log(this.getName())
    // console.log(this.data.monday * this.getDaysInMonth(startDate, endDate, 'Monday'));

    console.log((this.data.monday * this.getDaysInMonth(startDate, endDate, 'Monday')) +
      (this.data.tuesday * this.getDaysInMonth(startDate, endDate, 'Tuesday')) +
      (this.data.wednesday * this.getDaysInMonth(startDate, endDate, 'Wednesday')) +
      (this.data.thursday * this.getDaysInMonth(startDate, endDate, 'Thursday')) +
      (this.data.friday * this.getDaysInMonth(startDate, endDate, 'Friday')) +
      (this.data.saturday * this.getDaysInMonth(startDate, endDate, 'Saturday')) +
      (this.data.sunday * this.getDaysInMonth(startDate, endDate, 'Sunday')))


    return (this.data.monday * this.getDaysInMonth(startDate, endDate, 'Monday')) +
      (this.data.tuesday * this.getDaysInMonth(startDate, endDate, 'Tuesday')) +
      (this.data.wednesday * this.getDaysInMonth(startDate, endDate, 'Wednesday')) +
      (this.data.thursday * this.getDaysInMonth(startDate, endDate, 'Thursday')) +
      (this.data.friday * this.getDaysInMonth(startDate, endDate, 'Friday')) +
      (this.data.saturday * this.getDaysInMonth(startDate, endDate, 'Saturday')) +
      (this.data.sunday * this.getDaysInMonth(startDate, endDate, 'Sunday'))
  }

}

exports.ForecastReportMember = ForecastReportMember;

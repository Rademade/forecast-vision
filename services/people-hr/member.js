const axios = require('axios');
const moment = require('moment')

const APIKey = process.env.PEOPLEHR_API_KEY;

class PeopleHRMember {
  constructor(startDate, endDdate, memberDocument) {
    this.startDate = startDate;
    this.endDdate = endDdate;
    this.memberDocument = memberDocument;
    this.holidayData = null;
    this.abscenceData = null
  }

  getMemberForecastId () {
    return this.memberDocument.forecastId
  }

  async fetchAbsenceData () {
    try {
      let abscenceData = await axios.post('https://api.peoplehr.net/Absence', {
        APIKey: APIKey,
        Action: 'GetAbsenceDetail',
        EmployeeId: this.memberDocument.peopleHRId,
        StartDate: moment(this.startDate).format('YYYY-MM-DD'),
        EndDate: moment(this.endDdate).format('YYYY-MM-DD')
      })

      return abscenceData.data.Result;
    } catch (error) {
      console.log(error)
    }
  }


  async fetchHolidayData () {
    try {
      let holidayData = await axios.post('https://api.peoplehr.net/Holiday', {
        APIKey: APIKey,
        Action: 'GetHolidayDetail',
        EmployeeId: this.memberDocument.peopleHRId,
        StartDate: moment(this.startDate).format('YYYY-MM-DD'),
        EndDate: moment(this.endDdate).format('YYYY-MM-DD')
      })

      return holidayData.data.Result
    } catch (error) {
      console.log(error)
    }
  }

  async getHolidaysDays () {
    if (this.holidayData) {
      return this.holidayData
    } else {
      this.holidayData = await this.fetchHolidayData()

      return this.holidayData
    }
  }

  async getAbsenceDays () {
    if (this.abscenceData) {
      return this.abscenceData
    } else {
      this.abscenceData = await this.fetchAbsenceData()

      return this.abscenceData
    }
  }
}

module.exports.PeopleHRMember = PeopleHRMember

const axios = require('axios');
const moment = require('moment')

const APIKey = process.env.PEOPLEHR_API_KEY;

class PeopleHRMember {
  /**
   * @description Class for migrate PeopleHR data
   * @param startDate: Date
   * @param endDdate: Date
   * @param memberDocument: MemberModel
   */
  constructor(startDate, endDdate, peopleHRId) {
    this.startDate = startDate;
    this.endDdate = endDdate;
    this.peopleHRId = peopleHRId;
    this.holidayData = null;
    this.abscenceData = null
  }

  // TODO check self Absence leaves. Marked as other events
  async fetchAbsenceData () {
    try {
      let abscenceData = await axios.post('https://api.peoplehr.net/Absence', {
        APIKey: APIKey,
        Action: 'GetAbsenceDetail',
        EmployeeId: this.peopleHRId,
        StartDate: moment(this.startDate).format('YYYY-MM-DD'),
        EndDate: moment(this.endDdate).format('YYYY-MM-DD')
      });
      return abscenceData.data.Result;
    } catch (error) {
      console.log(error);
      return [];
    }
  }


  async fetchHolidayData () {
    try {
      let holidayData = await axios.post('https://api.peoplehr.net/Holiday', {
        APIKey: APIKey,
        Action: 'GetHolidayDetail',
        EmployeeId: this.peopleHRId,
        StartDate: moment(this.startDate).format('YYYY-MM-DD'),
        EndDate: moment(this.endDdate).format('YYYY-MM-DD')
      });
      return holidayData.data.Result
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  async getHolidaysDays () {
    if (this.holidayData) return this.holidayData;
    this.holidayData = await this.fetchHolidayData();
    return this.holidayData
  }

  async getAbsenceDays () {
    if (this.abscenceData) return this.abscenceData;
    this.abscenceData = await this.fetchAbsenceData();
    return this.abscenceData;
  }

}

module.exports.PeopleHRMember = PeopleHRMember;

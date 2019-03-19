const axios = require('axios');
const moment = require('moment')

const APIKey = process.env.PEOPLEHR_API_KEY || '4a64d971-0c41-4669-937e-c335239f5ed0';

class PeopleHRMember {
  constructor(startDate, endDdate, memberDocument) {
    this.startDate = startDate;
    this.endDdate = endDdate;
    this.memberDocument = memberDocument
  }

  async getAbsenceData () {
    try {
      const abscenceData = await axios.post('https://api.peoplehr.net/Absence', {
        APIKey: APIKey,
        Action: 'GetAbsenceDetail',
        EmployeeId: this.memberDocument.peopleHRId,
        StartDate: moment(this.startDate).format('YYYY-MM-DD'),
        EndDate: moment(this.endDdate).format('YYYY-MM-DD')
      })
    } catch (error) {
      console.log(error)
    }
  }


  async getHolidayData () {
    try {
      const holidayData = await axios.post('https://api.peoplehr.net/Holiday')
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports.PeopleHRMember = PeopleHRMember

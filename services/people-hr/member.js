const axios = require('axios');

const APIKey = process.env.PEOPLEHR_API_KEY || '8603977c-3378-4ec4-b6b7-b6fe7913fd1f';

class PeopleHRMember {
  constructor(startDate, endDdate, memberDocument) {
    this.startDate = startDate;
    this.endDdate = endDdate;
    this.memberDocument = memberDocument
  }

  async getAbsenceData () {
    try {
      const abscenceData = await axios.post('https://api.peoplehr.net/Absence')
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
